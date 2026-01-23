"""Settings and configuration endpoints."""

from fastapi import APIRouter

from app.services.tutor import GERMAN_LEVELS, GermanLevel

router = APIRouter()


@router.get("/levels")
async def get_german_levels() -> list[GermanLevel]:
    """Get available German proficiency levels with descriptions."""
    return list(GERMAN_LEVELS.values())


@router.get("/languages")
async def get_ui_languages() -> list[dict[str, str]]:
    """Get available UI languages."""
    return [
        {"code": "en", "name": "English", "native_name": "English"},
        {"code": "zh", "name": "Chinese", "native_name": "中文"},
        {"code": "de", "name": "German", "native_name": "Deutsch"},
    ]
