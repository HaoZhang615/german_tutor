import json
import logging
import uuid
from datetime import UTC, datetime

from azure.cosmos import CosmosClient, exceptions
from azure.identity import DefaultAzureCredential
from openai import AsyncAzureOpenAI

from app.config import get_settings
from app.models.scenario import Scenario, ScenarioCreate
from app.services.scenarios import SCENARIOS as DEFAULT_SCENARIOS

logger = logging.getLogger(__name__)


class ScenarioService:
    def __init__(self) -> None:
        settings = get_settings()
        self.enabled = False
        self.openai_client: AsyncAzureOpenAI | None = None

        # Initialize Azure credential
        credential = DefaultAzureCredential()

        # Initialize OpenAI client for generation (independent of CosmosDB)
        if settings.azure_openai_endpoint:
            try:
                if settings.azure_openai_api_key:
                    self.openai_client = AsyncAzureOpenAI(
                        api_key=settings.azure_openai_api_key,
                        api_version=settings.azure_openai_api_version,
                        azure_endpoint=settings.azure_openai_endpoint,
                    )
                else:
                    def get_token() -> str:
                        return credential.get_token(
                            "https://cognitiveservices.azure.com/.default"
                        ).token

                    self.openai_client = AsyncAzureOpenAI(
                        azure_ad_token_provider=get_token,
                        api_version=settings.azure_openai_api_version,
                        azure_endpoint=settings.azure_openai_endpoint,
                    )
                logger.info("OpenAI client initialized for scenario generation")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI client: {e}", exc_info=True)

        # Initialize CosmosDB for persistence (optional)
        if not settings.cosmosdb_endpoint:
            logger.warning("CosmosDB endpoint not configured. Scenario persistence disabled.")
            return

        try:
            self.cosmos_client = CosmosClient(settings.cosmosdb_endpoint, credential)
            self.database = self.cosmos_client.get_database_client(settings.cosmosdb_database)
            self.container = self.database.get_container_client(
                settings.cosmosdb_scenarios_container
            )
            self.enabled = True
            logger.info("ScenarioService initialized with CosmosDB")
        except Exception as e:
            logger.error(f"Failed to initialize CosmosDB for scenarios: {e}", exc_info=True)

    def get_all_scenarios(self, user_id: str) -> list[Scenario]:
        """Get all scenarios (system defaults + user custom ones)."""
        # Start with default scenarios
        all_scenarios = []

        # Convert default dict scenarios to Scenario objects
        for s_id, s_data in DEFAULT_SCENARIOS.items():
            # Create a mock scenario object for defaults
            # In a real app, we might want to store defaults in DB too
            s_obj = Scenario(
                id=s_id,
                user_id="system",
                created_at=datetime.now(UTC),
                is_public=True,
                is_custom=False,
                **s_data.model_dump(),
            )
            all_scenarios.append(s_obj)

        if not self.enabled:
            return all_scenarios

        try:
            query = "SELECT * FROM c WHERE c.user_id = @user_id"
            items = list(
                self.container.query_items(
                    query=query,
                    parameters=[{"name": "@user_id", "value": user_id}],
                    enable_cross_partition_query=True,
                )
            )

            for item in items:
                all_scenarios.append(Scenario(**item))

            return all_scenarios
        except Exception as e:
            logger.error(f"Failed to fetch user scenarios: {e}")
            return all_scenarios

    def get_scenario(self, scenario_id: str, user_id: str) -> Scenario | None:
        """Get a specific scenario by ID."""
        # Check defaults first
        if scenario_id in DEFAULT_SCENARIOS:
            s_data = DEFAULT_SCENARIOS[scenario_id]
            return Scenario(
                id=scenario_id,
                user_id="system",
                created_at=datetime.now(UTC),
                is_public=True,
                is_custom=False,
                **s_data.model_dump(),
            )

        if not self.enabled:
            return None

        try:
            # We need to query by ID and ensure user owns it (or it's public)
            # For now, just checking ownership via partition key
            item = self.container.read_item(item=scenario_id, partition_key=user_id)
            return Scenario(**item)
        except exceptions.CosmosResourceNotFoundError:
            return None
        except Exception as e:
            logger.error(f"Failed to fetch scenario {scenario_id}: {e}")
            return None

    def create_scenario(self, user_id: str, scenario_in: ScenarioCreate) -> Scenario | None:
        """Create a new custom scenario."""
        if not self.enabled:
            return None

        try:
            scenario_id = str(uuid.uuid4())
            now = datetime.now(UTC)

            scenario = Scenario(
                id=scenario_id,
                user_id=user_id,
                created_at=now,
                is_public=False,
                is_custom=True,
                # Fill in required fields if missing (fallback to English)
                title=scenario_in.title,
                title_de=scenario_in.title_de or scenario_in.title,
                description=scenario_in.description,
                description_de=scenario_in.description_de or scenario_in.description,
                target_role=scenario_in.target_role,
                difficulty=scenario_in.difficulty,
                suggested_level=scenario_in.suggested_level,
                topics=scenario_in.topics,
                icon=scenario_in.icon,
            )

            # Convert datetime to ISO string for CosmosDB
            item = scenario.model_dump()
            item["created_at"] = now.isoformat()

            self.container.create_item(body=item)
            return scenario
        except Exception as e:
            logger.error(f"Failed to create scenario: {e}")
            return None

    def delete_scenario(self, scenario_id: str, user_id: str) -> bool:
        """Delete a custom scenario."""
        if not self.enabled:
            return False

        try:
            self.container.delete_item(item=scenario_id, partition_key=user_id)
            return True
        except exceptions.CosmosResourceNotFoundError:
            return False
        except Exception as e:
            logger.error(f"Failed to delete scenario {scenario_id}: {e}")
            return False

    async def generate_scenario(self, topic: str, level: str) -> ScenarioCreate | None:
        """Generate a scenario structure from a topic using AI."""
        if self.openai_client is None:
            logger.warning("Scenario generation skipped: OpenAI client not initialized")
            return None

        settings = get_settings()

        system_prompt = """You are an expert German language curriculum designer.
Create a roleplay scenario based on the user's topic and proficiency level.
Return ONLY valid JSON matching this structure:
{
  "title": "Short title in English",
  "title_de": "Short title in German",
  "description": "Situation description in English",
  "description_de": "Situation description in German",
  "target_role": "The role the AI tutor plays (e.g. Waiter)",
  "difficulty": "Easy", "Medium", or "Hard",
  "topics": ["list", "of", "keywords"],
  "icon": "single emoji"
}
Ensure the German is natural and appropriate for the level."""

        try:
            response = await self.openai_client.chat.completions.create(
                model=settings.azure_openai_chat_deployment,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Topic: {topic}\nLevel: {level}"},
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = response.choices[0].message.content
            if not content:
                return None

            data = json.loads(content)

            return ScenarioCreate(
                title=data["title"],
                title_de=data["title_de"],
                description=data["description"],
                description_de=data["description_de"],
                target_role=data["target_role"],
                difficulty=data["difficulty"],
                suggested_level=level,  # type: ignore
                topics=data["topics"],
                icon=data["icon"],
            )
        except Exception as e:
            logger.error(f"Failed to generate scenario: {e}", exc_info=True)
            return None


_scenario_service: ScenarioService | None = None


def get_scenario_service() -> ScenarioService:
    global _scenario_service
    if _scenario_service is None:
        _scenario_service = ScenarioService()
    return _scenario_service
