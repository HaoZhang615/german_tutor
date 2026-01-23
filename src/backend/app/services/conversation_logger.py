import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Optional

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
            self.container = self.database.get_container_client(settings.cosmosdb_conversations_container)
            self.enabled = True
            logger.info("ConversationLogger initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ConversationLogger: {e}")
            self.enabled = False

    def log_conversation(
        self,
        session_id: str,
        messages: list[dict],
        level: str,
        voice: str,
        duration_seconds: float,
        ui_language: str,
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
                "level": level,
                "voice": voice,
                "ui_language": ui_language,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "duration_seconds": duration_seconds,
                "message_count": len(messages),
                "messages": messages,
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

    def get_conversations(self, limit: int = 50) -> list[dict]:
        if not self.enabled:
            return []
        
        try:
            query = "SELECT c.id, c.session_id, c.level, c.voice, c.created_at, c.duration_seconds, c.message_count FROM c ORDER BY c.created_at DESC OFFSET 0 LIMIT @limit"
            items = list(self.container.query_items(
                query=query,
                parameters=[{"name": "@limit", "value": limit}],
                enable_cross_partition_query=True,
            ))
            return items
        except Exception as e:
            logger.error(f"Failed to get conversations: {e}")
            return []

    def get_conversation(self, session_id: str) -> Optional[dict]:
        if not self.enabled:
            return None
        
        try:
            query = "SELECT * FROM c WHERE c.session_id = @session_id"
            items = list(self.container.query_items(
                query=query,
                parameters=[{"name": "@session_id", "value": session_id}],
                enable_cross_partition_query=True,
            ))
            return items[0] if items else None
        except Exception as e:
            logger.error(f"Failed to get conversation {session_id}: {e}")
            return None


_conversation_logger: Optional[ConversationLogger] = None


def get_conversation_logger() -> ConversationLogger:
    global _conversation_logger
    if _conversation_logger is None:
        _conversation_logger = ConversationLogger()
    return _conversation_logger
