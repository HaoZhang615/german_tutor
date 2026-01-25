import logging
import time
from datetime import UTC, datetime
from typing import Any

from azure.cosmos import CosmosClient, exceptions
from azure.identity import DefaultAzureCredential

from app.config import get_settings

logger = logging.getLogger(__name__)


class ConversationLogger:
    def __init__(self) -> None:
        settings = get_settings()

        if not settings.cosmosdb_endpoint:
            logger.warning("CosmosDB endpoint not configured. Conversation logging disabled.")
            self.enabled = False
            return

        try:
            credential = DefaultAzureCredential()
            self.cosmos_client = CosmosClient(settings.cosmosdb_endpoint, credential)
            self.database = self.cosmos_client.get_database_client(settings.cosmosdb_database)
            self.container = self.database.get_container_client(
                settings.cosmosdb_conversations_container
            )
            self.enabled = True
            logger.info("ConversationLogger initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ConversationLogger: {e}")
            self.enabled = False

    def log_conversation(
        self,
        session_id: str,
        messages: list[dict[str, Any]],
        level: str,
        voice: str,
        duration_seconds: float,
        ui_language: str,
        user_id: str | None = None,
        summary: dict[str, Any] | None = None,
    ) -> bool:
        if not self.enabled:
            return False

        if not messages:
            logger.info(f"Skipping log for session {session_id} - no messages")
            return False

        try:
            document = {
                "id": f"conv_{session_id}_{int(time.time() * 1000)}",
                "session_id": session_id,
                "user_id": user_id,
                "level": level,
                "voice": voice,
                "ui_language": ui_language,
                "created_at": datetime.now(UTC).isoformat(),
                "duration_seconds": duration_seconds,
                "message_count": len(messages),
                "messages": messages,
                "summary": summary,
            }

            self.container.create_item(body=document)
            logger.info(f"Logged conversation {session_id} ({len(messages)} messages)")
            return True

        except exceptions.CosmosHttpResponseError as e:
            logger.error(f"CosmosDB error logging conversation {session_id}: {e}")
            return False
        except Exception as e:
            logger.error(f"Failed to log conversation {session_id}: {e}")
            return False

    def get_conversations(self, user_id: str, limit: int = 50) -> list[dict[str, Any]]:
        if not self.enabled:
            return []

        try:
            query = (
                "SELECT c.id, c.session_id, c.level, c.voice, c.created_at, "
                "c.duration_seconds, c.message_count, c.user_id, c.summary FROM c "
                "WHERE c.user_id = @user_id ORDER BY c.created_at DESC OFFSET 0 LIMIT @limit"
            )
            items = list(
                self.container.query_items(
                    query=query,
                    parameters=[
                        {"name": "@user_id", "value": user_id},
                        {"name": "@limit", "value": limit},
                    ],
                    enable_cross_partition_query=True,
                )
            )
            # Map created_at to started_at for frontend compatibility
            for item in items:
                item["started_at"] = item.get("created_at")
            return items
        except Exception as e:
            logger.error(f"Failed to get conversations: {e}")
            return []

    def get_conversation(self, conversation_id: str, user_id: str) -> dict[str, Any] | None:
        if not self.enabled:
            return None

        try:
            query = "SELECT * FROM c WHERE c.id = @id AND c.user_id = @user_id"
            items = list(
                self.container.query_items(
                    query=query,
                    parameters=[
                        {"name": "@id", "value": conversation_id},
                        {"name": "@user_id", "value": user_id},
                    ],
                    enable_cross_partition_query=True,
                )
            )
            if items:
                item = items[0]
                item["started_at"] = item.get("created_at")
                return item
            return None
        except Exception as e:
            logger.error(f"Failed to get conversation {conversation_id}: {e}")
            return None


_conversation_logger: ConversationLogger | None = None


def get_conversation_logger() -> ConversationLogger:
    global _conversation_logger
    if _conversation_logger is None:
        _conversation_logger = ConversationLogger()
    return _conversation_logger
