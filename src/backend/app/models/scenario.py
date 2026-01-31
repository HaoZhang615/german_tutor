from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

GermanLevelCode = Literal["A1", "A2", "B1", "B2", "C1", "C2"]


def to_camel(string: str) -> str:
    """Convert snake_case to camelCase."""
    components = string.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


class ScenarioBase(BaseModel):
    """Base model for scenario data."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    title: str = Field(..., description="Title of the scenario in English")
    title_de: str = Field(..., description="Title of the scenario in German")
    description: str = Field(..., description="Description/instructions in English")
    description_de: str = Field(..., description="Description/instructions in German")
    target_role: str = Field(..., description="The role the AI tutor should play")
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    suggested_level: GermanLevelCode
    topics: list[str] = Field(default_factory=list, description="List of related topics")
    icon: str = Field(default="📝", description="Emoji icon for the scenario")


class ScenarioCreate(BaseModel):
    """Model for creating a new scenario."""

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
    )

    title: str
    description: str
    target_role: str
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    suggested_level: GermanLevelCode
    topics: list[str] = []
    # German translations are optional during creation (AI can generate them)
    title_de: str | None = None
    description_de: str | None = None
    icon: str = "📝"


class ScenarioGenerateRequest(BaseModel):
    """Request model for AI generation of a scenario."""

    topic: str = Field(..., description="The topic or situation the user wants to practice")
    level: GermanLevelCode = Field(default="B1", description="Target proficiency level")


class Scenario(ScenarioBase):
    """Full scenario model stored in DB."""

    id: str
    user_id: str
    created_at: datetime
    is_public: bool = False
    is_custom: bool = True
