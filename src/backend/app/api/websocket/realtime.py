import asyncio
import json
import logging
import time
import uuid
from typing import Any, Literal

import websockets
from azure.identity import DefaultAzureCredential
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.config import get_settings
from app.services.auth import verify_access_token
from app.services.conversation_logger import get_conversation_logger
from app.services.summary import generate_conversation_summary
from app.services.tutor import get_system_prompt

logger = logging.getLogger(__name__)
router = APIRouter()

AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default"
credential = DefaultAzureCredential()

LearningMode = Literal["teacher", "immersive"]


class ConversationTracker:
    """Tracks messages during a conversation session for logging."""

    def __init__(
        self,
        session_id: str,
        level: str,
        voice: str,
        ui_language: str,
        user_id: str | None = None,
        learning_mode: LearningMode = "teacher",
        scenario_id: str | None = None,
    ) -> None:
        self.session_id = session_id
        self.level = level
        self.voice = voice
        self.ui_language = ui_language
        self.user_id = user_id
        self.learning_mode = learning_mode
        self.scenario_id = scenario_id
        self.start_time = time.time()
        self.messages: list[dict[str, Any]] = []

    def add_user_message(self, transcript: str) -> None:
        if transcript:
            self.messages.append(
                {
                    "role": "user",
                    "content": transcript,
                    "timestamp": time.time(),
                }
            )

    def add_assistant_message(self, transcript: str) -> None:
        if transcript:
            self.messages.append(
                {
                    "role": "assistant",
                    "content": transcript,
                    "timestamp": time.time(),
                }
            )

    def get_duration(self) -> float:
        return time.time() - self.start_time

    async def log_conversation(self) -> None:
        if not self.messages:
            logger.info(f"Session {self.session_id}: No messages to log")
            return

        summary = await generate_conversation_summary(self.messages, self.level)
        if summary:
            score = summary.get("overall_score")
            logger.info(f"Session {self.session_id}: Generated summary with score {score}")

        conversation_logger = get_conversation_logger()
        conversation_logger.log_conversation(
            session_id=self.session_id,
            messages=self.messages,
            level=self.level,
            voice=self.voice,
            duration_seconds=self.get_duration(),
            ui_language=self.ui_language,
            user_id=self.user_id,
            summary=summary,
        )


def get_auth_headers() -> dict[str, str]:
    """Get authentication headers for Azure OpenAI.

    Uses API key if available, otherwise uses managed identity.
    """
    settings = get_settings()

    if settings.azure_openai_api_key:
        return {"api-key": settings.azure_openai_api_key}

    token = credential.get_token(AZURE_OPENAI_SCOPE)
    return {"Authorization": f"Bearer {token.token}"}


async def relay_messages(client_ws: WebSocket, azure_ws: Any, tracker: ConversationTracker) -> None:
    async def client_to_azure() -> None:
        try:
            while True:
                data = await client_ws.receive_text()
                try:
                    parsed = json.loads(data)
                    event_type = parsed.get("type", "")
                    if event_type == "conversation.item.create":
                        item = parsed.get("item", {})
                        if item.get("role") == "user":
                            content_list = item.get("content", [])
                            for content in content_list:
                                if content.get("type") == "input_text":
                                    text = content.get("text", "")
                                    if text:
                                        tracker.add_user_message(text)
                except json.JSONDecodeError:
                    pass
                await azure_ws.send(data)
        except WebSocketDisconnect:
            logger.info("Client WebSocket disconnected")
        except Exception as e:
            logger.error(f"Error forwarding client to Azure: {e}")

    async def azure_to_client() -> None:
        try:
            async for message in azure_ws:
                try:
                    data = json.loads(message)
                    event_type = data.get("type", "")

                    # Log important events
                    if event_type in ("session.created", "session.updated", "error"):
                        logger.info(f"Azure event: {event_type} - {json.dumps(data)}")

                    if event_type == "error":
                        logger.error(f"Azure OpenAI error: {data}")

                    if event_type == "conversation.item.input_audio_transcription.completed":
                        transcript = data.get("transcript", "")
                        tracker.add_user_message(transcript)
                    elif event_type == "response.audio_transcript.done":
                        transcript = data.get("transcript", "")
                        tracker.add_assistant_message(transcript)
                except json.JSONDecodeError:
                    pass

                await client_ws.send_text(message)
        except websockets.exceptions.ConnectionClosed as e:
            logger.warning(f"Azure WebSocket closed: code={e.code}, reason={e.reason}")
        except Exception as e:
            logger.error(f"Error forwarding Azure to client: {e}")

    tasks = [
        asyncio.create_task(client_to_azure()),
        asyncio.create_task(azure_to_client()),
    ]

    done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
    for task in pending:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


@router.websocket("/ws/realtime")
async def websocket_realtime(
    websocket: WebSocket,
    level: str = Query(default="A1", pattern="^(A1|A2|B1|B2|C1|C2)$"),
    ui_language: str = Query(default="en", pattern="^(en|zh|de)$"),
    voice: str = Query(
        default="alloy", pattern="^(alloy|ash|ballad|coral|echo|sage|shimmer|verse)$"
    ),
    learning_mode: LearningMode = Query(default="teacher"),
    scenario_id: str | None = Query(default=None),
    token: str | None = Query(default=None),
) -> None:
    settings = get_settings()
    client_ip = websocket.client.host if websocket.client else "unknown"
    session_id = str(uuid.uuid4())
    logger.info(
        f"Client connected from {client_ip}, session={session_id}, "
        f"level={level}, ui_language={ui_language}, voice={voice}, "
        f"learning_mode={learning_mode}, scenario_id={scenario_id}"
    )

    await websocket.accept()

    # Validate authentication token
    user_id: str | None = None
    if token:
        user_id = verify_access_token(token)
        if not user_id:
            logger.warning(f"Invalid token for session {session_id}")
            await websocket.send_text(
                json.dumps({"type": "error", "message": "Invalid or expired authentication token"})
            )
            await websocket.close(code=4001)
            return
        logger.info(f"Session {session_id} authenticated for user {user_id}")
    else:
        logger.warning(
            f"No token provided for session {session_id}, proceeding without authentication"
        )

    tracker = ConversationTracker(
        session_id,
        level,
        voice,
        ui_language,
        user_id=user_id,
        learning_mode=learning_mode,
        scenario_id=scenario_id,
    )

    if not settings.azure_openai_endpoint:
        await websocket.send_text(
            json.dumps({"type": "error", "message": "Azure OpenAI endpoint not configured"})
        )
        await websocket.close(code=1011)
        return

    azure_ws_url = settings.azure_openai_realtime_url

    try:
        headers = get_auth_headers()
        logger.info(
            f"Auth headers obtained, using {'API key' if 'api-key' in headers else 'Bearer token'}"
        )
    except Exception as e:
        logger.error(f"Failed to get auth headers: {e}")
        await websocket.send_text(json.dumps({"type": "error", "message": "Authentication failed"}))
        await websocket.close(code=1011)
        return

    logger.info(f"Connecting to Azure OpenAI: {azure_ws_url}")

    try:
        async with websockets.connect(azure_ws_url, additional_headers=headers) as azure_ws:
            logger.info("Connected to Azure OpenAI Realtime API")

            system_prompt = get_system_prompt(
                level, ui_language, learning_mode, scenario_id, user_id
            )
            session_update = {
                "type": "session.update",
                "session": {
                    "modalities": ["text", "audio"],
                    "instructions": system_prompt,
                    "voice": voice,
                    "input_audio_format": "pcm16",
                    "output_audio_format": "pcm16",
                    "input_audio_transcription": {"model": "whisper-1"},
                    "turn_detection": {"type": "server_vad"},
                },
            }
            logger.info(f"Sending session.update with voice={voice}, level={level}")
            logger.debug(f"Full session config: {json.dumps(session_update, indent=2)}")
            await azure_ws.send(json.dumps(session_update))
            logger.info("Session update sent, waiting for confirmation...")

            await relay_messages(websocket, azure_ws, tracker)

    except websockets.exceptions.InvalidHandshake as e:
        logger.error(f"Azure OpenAI handshake failed: {e}")
        await websocket.send_text(
            json.dumps({"type": "error", "message": "Failed to connect to Azure OpenAI"})
        )
        await websocket.close(code=1011)

    except WebSocketDisconnect:
        logger.info(f"Client {client_ip} disconnected, session={session_id}")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        try:
            await websocket.send_text(json.dumps({"type": "error", "message": str(e)}))
            await websocket.close(code=1011)
        except Exception:
            pass

    finally:
        await tracker.log_conversation()
        logger.info(f"Session {session_id} ended, logged {len(tracker.messages)} messages")
