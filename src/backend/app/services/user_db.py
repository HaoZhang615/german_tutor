"""User database service with in-memory storage for local development."""

import logging
import secrets
import uuid
from datetime import datetime

from app.config import get_settings
from app.models.user import OAuthAccount, OAuthProvider, User, UserCreate, UserProfile, UserUpdate
from app.services.auth import generate_token, hash_password, verify_password

logger = logging.getLogger(__name__)


class UserDB:
    """User database abstraction. Uses in-memory storage for local dev."""

    def __init__(self) -> None:
        self._users: dict[str, User] = {}
        self._email_index: dict[str, str] = {}  # email -> user_id
        self._oauth_index: dict[str, str] = {}  # "{provider}:{oauth_id}" -> user_id

    async def create_user(self, user_create: UserCreate) -> User:
        """Create a new user with email/password."""
        user_id = str(uuid.uuid4())

        user = User(
            id=user_id,
            email=user_create.email,
            hashed_password=hash_password(user_create.password),
            profile=user_create.profile,
            is_active=True,
            is_verified=False,
            created_at=datetime.utcnow(),
            verification_token=generate_token(),
        )

        self._users[user_id] = user
        self._email_index[user.email.lower()] = user_id

        logger.info(f"Created user: {user.email} (id={user_id})")
        return user

    async def create_oauth_user(self, oauth_account: OAuthAccount) -> User:
        """Create a new user from OAuth account."""
        user_id = str(uuid.uuid4())

        # OAuth users are pre-verified and have a random password
        user = User(
            id=user_id,
            email=oauth_account.email,
            hashed_password=hash_password(
                secrets.token_urlsafe(16)
            ),  # Random password (short enough for bcrypt)
            profile=UserProfile(
                display_name=oauth_account.name or oauth_account.email.split("@")[0],
            ),
            is_active=True,
            is_verified=True,  # OAuth users are pre-verified
            created_at=datetime.utcnow(),
            oauth_provider=oauth_account.provider,
            oauth_id=oauth_account.provider_user_id,
        )

        self._users[user_id] = user
        self._email_index[user.email.lower()] = user_id
        self._oauth_index[f"{oauth_account.provider}:{oauth_account.provider_user_id}"] = user_id

        logger.info(f"Created OAuth user: {user.email} via {oauth_account.provider}")
        return user

    async def get_user_by_id(self, user_id: str) -> User | None:
        """Get a user by ID."""
        return self._users.get(user_id)

    async def get_user_by_email(self, email: str) -> User | None:
        """Get a user by email."""
        user_id = self._email_index.get(email.lower())
        if user_id:
            return self._users.get(user_id)
        return None

    async def get_user_by_oauth(
        self, provider: OAuthProvider, provider_user_id: str
    ) -> User | None:
        """Get a user by OAuth provider and ID."""
        key = f"{provider}:{provider_user_id}"
        user_id = self._oauth_index.get(key)
        if user_id:
            return self._users.get(user_id)
        return None

    async def get_user_by_verification_token(self, token: str) -> User | None:
        """Get a user by verification token."""
        for user in self._users.values():
            if user.verification_token == token:
                return user
        return None

    async def get_user_by_reset_token(self, token: str) -> User | None:
        """Get a user by password reset token."""
        for user in self._users.values():
            if user.reset_token == token:
                if user.reset_token_expires and user.reset_token_expires > datetime.utcnow():
                    return user
        return None

    async def update_user(self, user_id: str, update: UserUpdate) -> User | None:
        """Update a user's profile or password."""
        user = self._users.get(user_id)
        if not user:
            return None

        if update.profile:
            user.profile = update.profile

        if update.password:
            if update.current_password:
                if not verify_password(update.current_password, user.hashed_password):
                    raise ValueError("Current password is incorrect")
            user.hashed_password = hash_password(update.password)

        self._users[user_id] = user
        logger.info(f"Updated user: {user.email}")
        return user

    async def verify_user(self, user_id: str) -> User | None:
        """Mark a user as verified."""
        user = self._users.get(user_id)
        if not user:
            return None

        user.is_verified = True
        user.verification_token = None
        self._users[user_id] = user

        logger.info(f"Verified user: {user.email}")
        return user

    async def set_reset_token(self, user_id: str) -> str | None:
        """Set a password reset token for a user."""
        user = self._users.get(user_id)
        if not user:
            return None

        token = generate_token()
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + __import__("datetime").timedelta(hours=1)
        self._users[user_id] = user

        return token

    async def reset_password(self, user_id: str, new_password: str) -> User | None:
        """Reset a user's password."""
        user = self._users.get(user_id)
        if not user:
            return None

        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        self._users[user_id] = user

        logger.info(f"Reset password for user: {user.email}")
        return user

    async def add_refresh_token(self, user_id: str, token: str) -> bool:
        """Add a refresh token to user's list."""
        user = self._users.get(user_id)
        if not user:
            return False

        # Keep only last 5 refresh tokens
        user.refresh_tokens = user.refresh_tokens[-4:] + [token]
        self._users[user_id] = user
        return True

    async def validate_refresh_token(self, user_id: str, token: str) -> bool:
        """Validate that a refresh token belongs to a user."""
        user = self._users.get(user_id)
        if not user:
            return False
        return token in user.refresh_tokens

    async def remove_refresh_token(self, user_id: str, token: str) -> bool:
        """Remove a refresh token from user's list."""
        user = self._users.get(user_id)
        if not user:
            return False

        if token in user.refresh_tokens:
            user.refresh_tokens.remove(token)
            self._users[user_id] = user
        return True

    async def link_oauth_account(self, user_id: str, oauth_account: OAuthAccount) -> User | None:
        """Link an OAuth account to an existing user."""
        user = self._users.get(user_id)
        if not user:
            return None

        user.oauth_provider = oauth_account.provider
        user.oauth_id = oauth_account.provider_user_id
        self._users[user_id] = user
        self._oauth_index[f"{oauth_account.provider}:{oauth_account.provider_user_id}"] = user_id

        logger.info(f"Linked {oauth_account.provider} to user: {user.email}")
        return user

    async def delete_user(self, user_id: str) -> bool:
        """Delete a user."""
        user = self._users.get(user_id)
        if not user:
            return False

        # Remove from indexes
        if user.email.lower() in self._email_index:
            del self._email_index[user.email.lower()]

        if user.oauth_provider and user.oauth_id:
            key = f"{user.oauth_provider}:{user.oauth_id}"
            if key in self._oauth_index:
                del self._oauth_index[key]

        del self._users[user_id]
        logger.info(f"Deleted user: {user.email}")
        return True


# Singleton instance
_user_db: UserDB | None = None


def get_user_db() -> UserDB:
    """Get or create the user database singleton."""
    global _user_db
    if _user_db is None:
        settings = get_settings()
        # For now, always use in-memory storage
        # TODO: Add CosmosDB implementation when cosmosdb_endpoint is set
        _user_db = UserDB()
        logger.info("Using in-memory user database")
    return _user_db
