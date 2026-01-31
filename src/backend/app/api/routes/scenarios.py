from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.api.routes.auth import get_current_user
from app.models.scenario import Scenario, ScenarioCreate, ScenarioGenerateRequest
from app.models.user import User
from app.services.scenario_service import get_scenario_service

router = APIRouter()


@router.get("/scenarios", response_model_by_alias=True)
async def list_scenarios(
    current_user: Annotated[User, Depends(get_current_user)],
) -> list[Scenario]:
    """List all available scenarios (system defaults + user custom ones)."""
    service = get_scenario_service()
    return service.get_all_scenarios(user_id=current_user.id)


@router.post("/scenarios", response_model_by_alias=True)
async def create_scenario(
    scenario_in: ScenarioCreate,
    current_user: Annotated[User, Depends(get_current_user)],
) -> Scenario:
    """Create a new custom scenario."""
    service = get_scenario_service()
    scenario = service.create_scenario(user_id=current_user.id, scenario_in=scenario_in)

    if not scenario:
        raise HTTPException(status_code=500, detail="Failed to create scenario")

    return scenario


@router.delete("/scenarios/{scenario_id}")
async def delete_scenario(
    scenario_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
) -> dict[str, bool]:
    """Delete a custom scenario."""
    service = get_scenario_service()
    success = service.delete_scenario(scenario_id=scenario_id, user_id=current_user.id)

    if not success:
        raise HTTPException(status_code=404, detail="Scenario not found or could not be deleted")

    return {"success": True}


@router.post("/scenarios/generate", response_model_by_alias=True)
async def generate_scenario(
    request: ScenarioGenerateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
) -> ScenarioCreate:
    """Generate a scenario structure from a topic using AI."""
    service = get_scenario_service()
    scenario = await service.generate_scenario(topic=request.topic, level=request.level)

    if not scenario:
        raise HTTPException(status_code=500, detail="Failed to generate scenario")

    return scenario
