"""Configuration settings for the German Tutor backend."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=("../../.env", ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Azure OpenAI Configuration
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""  # Optional: uses managed identity if not set
    azure_openai_realtime_deployment: str = "gpt-realtime"
    azure_openai_tts_deployment: str = "gpt-mini-tts"
    azure_openai_chat_deployment: str = "gpt-4.1-mini"  # For summaries
    azure_openai_api_version: str = "2025-04-01-preview"

    # Azure CosmosDB Configuration
    cosmosdb_endpoint: str = ""
    cosmosdb_database: str = "GermanTutor"
    cosmosdb_conversations_container: str = "Conversations"
    cosmosdb_scenarios_container: str = "Scenarios"

    # Server Configuration
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Application Configuration
    debug: bool = False
    frontend_url: str = "http://localhost:5173"

    # JWT Configuration
    jwt_secret_key: str = "change-me-in-production-use-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # OAuth Configuration - Google
    google_client_id: str = ""
    google_client_secret: str = ""

    # OAuth Configuration - GitHub
    github_client_id: str = ""
    github_client_secret: str = ""

    # Email Configuration (for verification emails)
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""

    @property
    def google_oauth_enabled(self) -> bool:
        """Check if Google OAuth is configured."""
        return bool(self.google_client_id and self.google_client_secret)

    @property
    def github_oauth_enabled(self) -> bool:
        """Check if GitHub OAuth is configured."""
        return bool(self.github_client_id and self.github_client_secret)

    @property
    def smtp_enabled(self) -> bool:
        """Check if SMTP is configured."""
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def azure_openai_realtime_url(self) -> str:
        """Construct the Azure OpenAI Realtime WebSocket URL."""
        endpoint = self.azure_openai_endpoint.rstrip("/")
        return (
            f"{endpoint.replace('https://', 'wss://')}/openai/realtime"
            f"?api-version={self.azure_openai_api_version}"
            f"&deployment={self.azure_openai_realtime_deployment}"
        )


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
