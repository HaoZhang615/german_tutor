"""User models for authentication and profile management."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

# Type aliases matching frontend
GermanLevel = Literal["A1", "A2", "B1", "B2", "C1", "C2"]
UILanguage = Literal["en", "zh", "de"]
TutorVoice = Literal["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"]
OAuthProvider = Literal["google", "github"]


class UserProfile(BaseModel):
    """User profile settings."""

    display_name: str = ""
    native_language: UILanguage = "zh"
    preferred_ui_language: UILanguage = "en"
    german_level: GermanLevel = "A1"
    preferred_voice: TutorVoice = "alloy"


class UserBase(BaseModel):
    """Base user fields."""

    email: EmailStr


class UserCreate(UserBase):
    """User registration request."""

    password: str = Field(..., min_length=8)
    profile: UserProfile = Field(default_factory=UserProfile)


class UserUpdate(BaseModel):
    """User update request."""

    profile: UserProfile | None = None
    current_password: str | None = None
    password: str | None = Field(default=None, min_length=8)


class User(UserBase):
    """Full user model stored in database."""

    id: str
    hashed_password: str
    profile: UserProfile = Field(default_factory=UserProfile)
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    oauth_provider: OAuthProvider | None = None
    oauth_id: str | None = None
    verification_token: str | None = None
    reset_token: str | None = None
    reset_token_expires: datetime | None = None
    refresh_tokens: list[str] = Field(default_factory=list)


class UserRead(UserBase):
    """User data returned to client (no sensitive fields)."""

    id: str
    profile: UserProfile
    is_active: bool
    is_verified: bool
    created_at: str
    oauth_provider: OAuthProvider | None

    @classmethod
    def from_user(cls, user: User) -> "UserRead":
        """Create UserRead from User model."""
        return cls(
            id=user.id,
            email=user.email,
            profile=user.profile,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at.isoformat(),
            oauth_provider=user.oauth_provider,
        )


class TokenPayload(BaseModel):
    """JWT token payload."""

    sub: str  # user_id
    exp: datetime
    type: Literal["access", "refresh"]


class TokenResponse(BaseModel):
    """Token response for login/refresh."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class OAuthAccount(BaseModel):
    """OAuth account info from provider."""

    provider: OAuthProvider
    provider_user_id: str
    email: EmailStr
    name: str | None = None


class LoginRequest(BaseModel):
    """Login request body."""

    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Refresh token request body."""

    refresh_token: str


class OAuthCallbackRequest(BaseModel):
    """OAuth callback request body."""

    code: str
    state: str | None = None


class EmailRequest(BaseModel):
    """Email-only request body."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Password reset request body."""

    token: str
    new_password: str = Field(..., min_length=8)
