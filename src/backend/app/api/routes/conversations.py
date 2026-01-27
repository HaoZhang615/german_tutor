from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.auth import get_current_user
from app.models.user import User
from app.services.conversation_logger import get_conversation_logger

router = APIRouter()


@router.get("/conversations")
async def list_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = 50,
) -> list[dict[str, Any]]:
    conversation_logger = get_conversation_logger()
    return conversation_logger.get_conversations(user_id=current_user.id, limit=limit)


@router.get("/conversations/export")
async def export_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[dict[str, Any]]:
    conversation_logger = get_conversation_logger()
    return conversation_logger.get_all_conversations_full(user_id=current_user.id)


@router.delete("/conversations")
async def delete_all_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, Any]:
    conversation_logger = get_conversation_logger()
    deleted_count = conversation_logger.delete_all_conversations(user_id=current_user.id)
    return {"deleted": deleted_count}


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, Any]:
    conversation_logger = get_conversation_logger()
    deleted = conversation_logger.delete_conversation(
        conversation_id=conversation_id, user_id=current_user.id
    )

    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {"deleted": True}


@router.get("/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, Any]:
    conversation_logger = get_conversation_logger()
    conversation = conversation_logger.get_conversation(
        conversation_id=conversation_id, user_id=current_user.id
    )

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation
