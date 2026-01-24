"""User routes for profile management."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.routes.auth import get_current_user, get_current_verified_user
from app.models.user import User, UserRead, UserUpdate
from app.services.user_db import get_user_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users")


@router.get("/me", response_model=UserRead)
async def get_current_user_info(
    user: Annotated[User, Depends(get_current_user)],
) -> UserRead:
    """Get current user's information."""
    return UserRead.from_user(user)


@router.patch("/me", response_model=UserRead)
async def update_current_user(
    user: Annotated[User, Depends(get_current_user)],
    update: UserUpdate,
) -> UserRead:
    """Update current user's profile or password."""
    user_db = get_user_db()

    try:
        updated_user = await user_db.update_user(user.id, update)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        logger.info(f"Updated user profile: {user.email}")
        return UserRead.from_user(updated_user)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.delete("/me")
async def delete_current_user(
    user: Annotated[User, Depends(get_current_user)],
) -> dict[str, str]:
    """Delete current user's account."""
    user_db = get_user_db()

    success = await user_db.delete_user(user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account",
        )

    logger.info(f"Deleted user: {user.email}")
    return {"message": "Account deleted successfully"}
