from typing import Literal

from pydantic import BaseModel


class GermanLevel(BaseModel):
    code: Literal["A1", "A2", "B1", "B2", "C1", "C2"]
    name: str
    name_zh: str
    name_de: str
    description: str
    description_zh: str
    description_de: str


class SessionConfig(BaseModel):
    german_level: Literal["A1", "A2", "B1", "B2", "C1", "C2"] = "A1"
    voice: str = "alloy"
    ui_language: Literal["en", "zh", "de"] = "en"


class WebSocketMessage(BaseModel):
    type: str
    data: dict | None = None
