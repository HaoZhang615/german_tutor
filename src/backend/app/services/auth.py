"""Authentication service with password hashing, JWT tokens, and OAuth."""

import logging
import secrets
from datetime import datetime, timedelta
from typing import Literal
from urllib.parse import urlencode

import bcrypt
import httpx
import jwt

from app.config import get_settings
from app.models.user import OAuthAccount, OAuthProvider, TokenPayload, TokenResponse

logger = logging.getLogger(__name__)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def generate_token() -> str:
    """Generate a secure random token for email verification or password reset."""
    return secrets.token_urlsafe(32)


# JWT tokens
def create_token(user_id: str, token_type: Literal["access", "refresh"]) -> str:
    """Create a JWT token."""
    settings = get_settings()

    if token_type == "access":
        expires_delta = timedelta(minutes=settings.jwt_access_token_expire_minutes)
    else:
        expires_delta = timedelta(days=settings.jwt_refresh_token_expire_days)

    expire = datetime.utcnow() + expires_delta
    payload = TokenPayload(sub=user_id, exp=expire, type=token_type)

    return jwt.encode(
        payload.model_dump(),
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


def create_tokens(user_id: str) -> TokenResponse:
    """Create both access and refresh tokens."""
    return TokenResponse(
        access_token=create_token(user_id, "access"),
        refresh_token=create_token(user_id, "refresh"),
    )


def decode_token(token: str) -> TokenPayload | None:
    """Decode and validate a JWT token."""
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        logger.debug("Token expired")
        return None
    except jwt.InvalidTokenError as e:
        logger.debug(f"Invalid token: {e}")
        return None


def verify_access_token(token: str) -> str | None:
    """Verify an access token and return the user_id if valid."""
    payload = decode_token(token)
    if payload and payload.type == "access":
        return payload.sub
    return None


def verify_refresh_token(token: str) -> str | None:
    """Verify a refresh token and return the user_id if valid."""
    payload = decode_token(token)
    if payload and payload.type == "refresh":
        return payload.sub
    return None


# OAuth
class OAuthClient:
    """OAuth client for Google and GitHub."""

    def __init__(self) -> None:
        self.settings = get_settings()

    def get_authorization_url(self, provider: OAuthProvider) -> str:
        """Get the OAuth authorization URL for a provider."""
        settings = self.settings
        redirect_uri = f"{settings.frontend_url.rstrip('/')}/auth/callback/{provider}"
        state = secrets.token_urlsafe(16)

        if provider == "google":
            params = {
                "client_id": settings.google_client_id,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "state": state,
                "access_type": "offline",
                "prompt": "consent",
            }
            return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"

        elif provider == "github":
            params = {
                "client_id": settings.github_client_id,
                "redirect_uri": redirect_uri,
                "scope": "user:email",
                "state": state,
            }
            return f"https://github.com/login/oauth/authorize?{urlencode(params)}"

        raise ValueError(f"Unsupported provider: {provider}")

    async def get_oauth_account(self, provider: OAuthProvider, code: str) -> OAuthAccount | None:
        """Exchange OAuth code for user info."""
        settings = self.settings
        redirect_uri = f"{settings.frontend_url.rstrip('/')}/auth/callback/{provider}"

        try:
            async with httpx.AsyncClient() as client:
                if provider == "google":
                    return await self._get_google_account(client, code, redirect_uri)
                elif provider == "github":
                    return await self._get_github_account(client, code, redirect_uri)
        except Exception as e:
            logger.error(f"OAuth error for {provider}: {e}")
            return None

        return None

    async def _get_google_account(
        self, client: httpx.AsyncClient, code: str, redirect_uri: str
    ) -> OAuthAccount | None:
        """Get Google account info from OAuth code."""
        settings = self.settings

        # Exchange code for tokens
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
        )

        if token_response.status_code != 200:
            logger.error(f"Google token error: {token_response.text}")
            return None

        tokens = token_response.json()
        access_token = tokens.get("access_token")

        # Get user info
        userinfo_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if userinfo_response.status_code != 200:
            logger.error(f"Google userinfo error: {userinfo_response.text}")
            return None

        userinfo = userinfo_response.json()

        return OAuthAccount(
            provider="google",
            provider_user_id=userinfo["id"],
            email=userinfo["email"],
            name=userinfo.get("name"),
        )

    async def _get_github_account(
        self, client: httpx.AsyncClient, code: str, redirect_uri: str
    ) -> OAuthAccount | None:
        """Get GitHub account info from OAuth code."""
        settings = self.settings

        # Exchange code for token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )

        if token_response.status_code != 200:
            logger.error(f"GitHub token error: {token_response.text}")
            return None

        tokens = token_response.json()
        access_token = tokens.get("access_token")

        if not access_token:
            logger.error(f"GitHub token missing: {tokens}")
            return None

        # Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github.v3+json",
            },
        )

        if user_response.status_code != 200:
            logger.error(f"GitHub user error: {user_response.text}")
            return None

        user_data = user_response.json()

        # Get email (may be private)
        email = user_data.get("email")
        if not email:
            email_response = await client.get(
                "https://api.github.com/user/emails",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json",
                },
            )
            if email_response.status_code == 200:
                emails = email_response.json()
                primary = next((e for e in emails if e.get("primary")), None)
                if primary:
                    email = primary["email"]

        if not email:
            logger.error("GitHub email not available")
            return None

        return OAuthAccount(
            provider="github",
            provider_user_id=str(user_data["id"]),
            email=email,
            name=user_data.get("name") or user_data.get("login"),
        )


_oauth_client: OAuthClient | None = None


def get_oauth_client() -> OAuthClient:
    """Get or create the OAuth client singleton."""
    global _oauth_client
    if _oauth_client is None:
        _oauth_client = OAuthClient()
    return _oauth_client


def reset_oauth_client() -> None:
    """Reset the OAuth client singleton (for use after settings reload)."""
    global _oauth_client
    _oauth_client = None
