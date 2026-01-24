"""Authentication routes for registration, login, OAuth, and password management."""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings
from app.models.user import (
    EmailRequest,
    LoginRequest,
    OAuthCallbackRequest,
    OAuthProvider,
    RefreshRequest,
    ResetPasswordRequest,
    TokenResponse,
    User,
    UserCreate,
    UserRead,
)
from app.services.auth import (
    create_token,
    create_tokens,
    get_oauth_client,
    verify_access_token,
    verify_password,
    verify_refresh_token,
)
from app.services.user_db import get_user_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth")

# Security scheme
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> User:
    """Get the current authenticated user from JWT token."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = verify_access_token(credentials.credentials)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user_db = get_user_db()
    user = await user_db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


async def get_current_verified_user(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Get the current user, ensuring they are verified."""
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified",
        )
    return user


@router.post("/register", response_model=UserRead)
async def register(user_create: UserCreate) -> UserRead:
    """Register a new user with email and password."""
    user_db = get_user_db()

    # Check if email already exists
    existing = await user_db.get_user_by_email(user_create.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = await user_db.create_user(user_create)

    # TODO: Send verification email
    logger.info(f"User registered: {user.email} (verification token: {user.verification_token})")

    return UserRead.from_user(user)


@router.post("/login", response_model=TokenResponse)
async def login(login_req: LoginRequest) -> TokenResponse:
    """Login with email and password."""
    user_db = get_user_db()

    user = await user_db.get_user_by_email(login_req.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(login_req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    tokens = create_tokens(user.id)
    await user_db.add_refresh_token(user.id, tokens.refresh_token)

    logger.info(f"User logged in: {user.email}")
    return tokens


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_req: RefreshRequest) -> TokenResponse:
    """Refresh access token using refresh token."""
    user_id = verify_refresh_token(refresh_req.refresh_token)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    user_db = get_user_db()

    # Validate refresh token belongs to user
    is_valid = await user_db.validate_refresh_token(user_id, refresh_req.refresh_token)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    user = await user_db.get_user_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Remove old refresh token and create new tokens
    await user_db.remove_refresh_token(user_id, refresh_req.refresh_token)
    tokens = create_tokens(user.id)
    await user_db.add_refresh_token(user.id, tokens.refresh_token)

    return tokens


@router.post("/verify-email")
async def verify_email(token: Annotated[str, Query(...)]) -> dict[str, str]:
    """Verify email with token."""
    user_db = get_user_db()

    user = await user_db.get_user_by_verification_token(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    await user_db.verify_user(user.id)

    return {"message": "Email verified successfully"}


@router.post("/resend-verification")
async def resend_verification(email_req: EmailRequest) -> dict[str, str]:
    """Resend verification email."""
    user_db = get_user_db()

    user = await user_db.get_user_by_email(email_req.email)
    if user and not user.is_verified:
        # TODO: Send verification email
        logger.info(f"Resend verification for: {user.email} (token: {user.verification_token})")

    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a verification email has been sent"}


@router.post("/forgot-password")
async def forgot_password(email_req: EmailRequest) -> dict[str, str]:
    """Request password reset email."""
    user_db = get_user_db()

    user = await user_db.get_user_by_email(email_req.email)
    if user:
        token = await user_db.set_reset_token(user.id)
        # TODO: Send reset email
        logger.info(f"Password reset requested for: {user.email} (token: {token})")

    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(reset_req: ResetPasswordRequest) -> dict[str, str]:
    """Reset password with token."""
    user_db = get_user_db()

    user = await user_db.get_user_by_reset_token(reset_req.token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    await user_db.reset_password(user.id, reset_req.new_password)

    return {"message": "Password reset successfully"}


# OAuth routes
@router.get("/oauth/{provider}/authorize")
async def oauth_authorize(provider: OAuthProvider) -> dict[str, str]:
    """Get OAuth authorization URL."""
    settings = get_settings()

    if provider == "google" and not settings.google_oauth_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google OAuth is not configured",
        )

    if provider == "github" and not settings.github_oauth_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GitHub OAuth is not configured",
        )

    oauth_client = get_oauth_client()
    authorization_url = oauth_client.get_authorization_url(provider)

    return {"authorization_url": authorization_url}


@router.post("/oauth/{provider}/callback", response_model=TokenResponse)
async def oauth_callback(
    provider: OAuthProvider,
    callback_req: OAuthCallbackRequest,
) -> TokenResponse:
    """Handle OAuth callback and create/login user."""
    oauth_client = get_oauth_client()
    user_db = get_user_db()

    # Get OAuth account info
    oauth_account = await oauth_client.get_oauth_account(provider, callback_req.code)
    if not oauth_account:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to get account info from provider",
        )

    # Check if user exists with this OAuth account
    user = await user_db.get_user_by_oauth(provider, oauth_account.provider_user_id)

    if not user:
        # Check if user exists with this email
        user = await user_db.get_user_by_email(oauth_account.email)

        if user:
            # Link OAuth to existing account
            linked_user = await user_db.link_oauth_account(user.id, oauth_account)
            if linked_user is not None:
                # Mark as verified if not already
                if not linked_user.is_verified:
                    await user_db.verify_user(linked_user.id)
                user = linked_user
        else:
            # Create new user
            user = await user_db.create_oauth_user(oauth_account)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create or find user",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled",
        )

    tokens = create_tokens(user.id)
    await user_db.add_refresh_token(user.id, tokens.refresh_token)

    logger.info(f"OAuth login: {user.email} via {provider}")
    return tokens
