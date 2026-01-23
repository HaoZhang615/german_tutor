from fastapi import APIRouter, HTTPException

from app.services.conversation_logger import get_conversation_logger

router = APIRouter()


@router.get("/conversations")
async def list_conversations(limit: int = 50) -> list[dict]:
    conversation_logger = get_conversation_logger()
    return conversation_logger.get_conversations(limit=limit)


@router.get("/conversations/{session_id}")
async def get_conversation(session_id: str) -> dict:
    conversation_logger = get_conversation_logger()
    conversation = conversation_logger.get_conversation(session_id)
    
    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return conversation
