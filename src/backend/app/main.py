"""FastAPI main application module."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, conversations, health, scenarios, tts, users
from app.api.routes import settings as settings_routes
from app.api.websocket import realtime
from app.config import get_settings
from app.services.auth import reset_oauth_client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    """Application lifespan handler for startup and shutdown events."""
    # Clear caches to ensure fresh load after uvicorn --env-file
    get_settings.cache_clear()
    reset_oauth_client()
    settings = get_settings()
    logger.info("Starting German Tutor Backend...")
    logger.info(f"Azure OpenAI Endpoint: {settings.azure_openai_endpoint}")
    logger.info(f"Realtime Deployment: {settings.azure_openai_realtime_deployment}")
    logger.info(f"Google OAuth: {'enabled' if settings.google_oauth_enabled else 'disabled'}")
    logger.info(f"GitHub OAuth: {'enabled' if settings.github_oauth_enabled else 'disabled'}")
    yield
    logger.info("Shutting down German Tutor Backend...")


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="German Tutor API",
        description="AI-powered German language tutor with real-time voice interaction",
        version="0.2.0",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health.router, tags=["Health"])
    app.include_router(auth.router, prefix="/api", tags=["Auth"])
    app.include_router(users.router, prefix="/api", tags=["Users"])
    app.include_router(settings_routes.router, prefix="/api", tags=["Settings"])
    app.include_router(conversations.router, prefix="/api", tags=["Conversations"])
    app.include_router(tts.router, prefix="/api", tags=["TTS"])
    app.include_router(scenarios.router, prefix="/api", tags=["Scenarios"])

    # Include WebSocket endpoints
    app.include_router(realtime.router, tags=["Realtime"])

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.debug,
    )
