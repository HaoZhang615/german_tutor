"""TTS (Text-to-Speech) API routes for voice preview."""

import logging
from typing import Literal

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from openai import AsyncAzureOpenAI

from app.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default"

PREVIEW_TEXT = "Guten Tag! Ich bin Ihr Deutschlehrer. Wie kann ich Ihnen heute helfen?"

VoiceType = Literal["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"]


@router.get("/tts/preview")
async def preview_voice(
    voice: VoiceType = Query(default="alloy", description="Voice to preview"),
) -> Response:
    """Generate a voice preview audio sample.
    
    Returns MP3 audio data for the specified voice.
    """
    settings = get_settings()

    if not settings.azure_openai_endpoint:
        raise HTTPException(status_code=503, detail="Azure OpenAI endpoint not configured")

    if not settings.azure_openai_tts_deployment:
        raise HTTPException(status_code=503, detail="TTS deployment not configured")

    # Use api_version from working example for TTS specifically, or fallback to settings
    api_version = "2025-03-01-preview"

    if settings.azure_openai_api_key:
        client = AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=api_version,
            azure_endpoint=settings.azure_openai_endpoint
        )
    else:
        token_provider = get_bearer_token_provider(
            DefaultAzureCredential(), AZURE_OPENAI_SCOPE
        )
        client = AsyncAzureOpenAI(
            azure_ad_token_provider=token_provider,
            api_version=api_version,
            azure_endpoint=settings.azure_openai_endpoint
        )

    try:
        response = await client.audio.speech.create(
            model=settings.azure_openai_tts_deployment,
            voice=voice,
            input=PREVIEW_TEXT,
            response_format="mp3"
        )

        audio_data = response.content

        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": f"inline; filename=preview-{voice}.mp3",
                "Cache-Control": "public, max-age=86400",
            }
        )

    except Exception as e:
        logger.error(f"TTS API error: {e}")
        raise HTTPException(status_code=502, detail=f"TTS API request error: {str(e)}")
