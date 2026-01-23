"""Configuration settings for the German Tutor backend."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Azure OpenAI Configuration
    azure_openai_endpoint: str = ""
    azure_openai_api_key: str = ""  # Optional: uses managed identity if not set
    azure_openai_realtime_deployment: str = "gpt-realtime"
    azure_openai_tts_deployment: str = "gpt-4o-mini-tts"
    azure_openai_api_version: str = "2025-04-01-preview"

    # Azure CosmosDB Configuration
    cosmosdb_endpoint: str = ""
    cosmosdb_database: str = "GermanTutor"
    cosmosdb_conversations_container: str = "Conversations"

    # Server Configuration
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # Application Configuration
    debug: bool = False

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
