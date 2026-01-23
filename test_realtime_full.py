import asyncio
import os
import websockets
import json
import logging
from azure.identity import DefaultAzureCredential

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_realtime")

# Configuration from .azure/germantutor/.env (hardcoded for test)
ENDPOINT = "https://cog-o4536ytwnritq.openai.azure.com/"
DEPLOYMENT = "gpt-realtime"
API_VERSION = "2025-04-01-preview"

credential = DefaultAzureCredential()

async def test_connection():
    try:
        token = credential.get_token("https://cognitiveservices.azure.com/.default").token
        logger.info("Got auth token")
    except Exception as e:
        logger.error(f"Failed to get token: {e}")
        return

    ws_endpoint = ENDPOINT.replace("https://", "wss://").rstrip("/")
    url = f"{ws_endpoint}/openai/realtime?api-version={API_VERSION}&deployment={DEPLOYMENT}"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "GermanTutorTest/1.0",
        "OpenAI-Beta": "realtime=v1" # Some versions require this header?
    }
    
    logger.info(f"Connecting to {url}")
    
    try:
        async with websockets.connect(url, additional_headers=headers) as ws:
            logger.info("Connected to Azure OpenAI Realtime API!")
            
            # Send session update
            session_update = {
                "type": "session.update",
                "session": {
                    "modalities": ["text", "audio"],
                    "instructions": "You are a helpful assistant.",
                    "voice": "alloy",
                    "input_audio_format": "pcm16",
                    "output_audio_format": "pcm16",
                    "turn_detection": {
                        "type": "server_vad"
                    }
                }
            }
            
            logger.info("Sending session.update...")
            await ws.send(json.dumps(session_update))
            
            # Wait for response
            while True:
                try:
                    msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    data = json.loads(msg)
                    logger.info(f"Received: {data['type']}")
                    if data['type'] == 'session.updated':
                        logger.info("Session updated successfully!")
                        break
                    if data['type'] == 'error':
                        logger.error(f"Error from server: {data}")
                        break
                except asyncio.TimeoutError:
                    logger.warning("Timeout waiting for response")
                    break
                    
    except websockets.exceptions.InvalidHandshake as e:
        logger.error(f"Handshake failed: {e}")
    except Exception as e:
        logger.error(f"Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
