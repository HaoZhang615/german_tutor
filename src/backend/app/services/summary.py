import logging
from typing import Any

from azure.identity import DefaultAzureCredential, get_bearer_token_provider
from openai import AsyncAzureOpenAI

from app.config import get_settings

logger = logging.getLogger(__name__)

AZURE_OPENAI_SCOPE = "https://cognitiveservices.azure.com/.default"

SUMMARY_SYSTEM_PROMPT = """You are an expert German language tutor reviewing a \
conversation between a student and their AI tutor.

Analyze the conversation and provide a brief, constructive summary in JSON format with these fields:
- "overall_score": number 1-10 rating the student's performance
- "fluency": number 1-10 rating speaking fluency and natural expression
- "grammar": number 1-10 rating grammatical accuracy
- "vocabulary": number 1-10 rating vocabulary usage and variety
- "comprehension": number 1-10 rating understanding of the tutor
- "highlights": array of 2-3 things the student did well (short phrases)
- "improvements": array of 2-3 specific areas to work on (short phrases)
- "new_vocabulary": array of new/notable German words used (max 5)
- "topic": brief description of what was discussed (max 10 words)

Be encouraging but honest. Focus on actionable feedback.
Respond ONLY with valid JSON, no markdown or explanation."""


async def generate_conversation_summary(
    messages: list[dict[str, Any]],
    level: str,
) -> dict[str, Any] | None:
    if not messages or len(messages) < 2:
        return None

    settings = get_settings()

    if not settings.azure_openai_endpoint or not settings.azure_openai_chat_deployment:
        logger.warning("Chat deployment not configured, skipping summary generation")
        return None

    conversation_text = _format_conversation(messages)

    try:
        client = _get_openai_client(settings)

        response = await client.chat.completions.create(
            model=settings.azure_openai_chat_deployment,
            messages=[
                {"role": "system", "content": SUMMARY_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": f"Student level: {level}\n\nConversation:\n{conversation_text}",
                },
            ],
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        if content:
            import json

            result: dict[str, Any] = json.loads(content)
            return result
        return None

    except Exception as e:
        logger.error(f"Failed to generate summary: {e}")
        return None


def _format_conversation(messages: list[dict[str, Any]]) -> str:
    lines = []
    for msg in messages:
        role = "Student" if msg.get("role") == "user" else "Tutor"
        content = msg.get("content", "")
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _get_openai_client(settings: Any) -> AsyncAzureOpenAI:
    api_version = "2024-10-21"

    if settings.azure_openai_api_key:
        return AsyncAzureOpenAI(
            api_key=settings.azure_openai_api_key,
            api_version=api_version,
            azure_endpoint=settings.azure_openai_endpoint,
        )

    token_provider = get_bearer_token_provider(DefaultAzureCredential(), AZURE_OPENAI_SCOPE)
    return AsyncAzureOpenAI(
        azure_ad_token_provider=token_provider,
        api_version=api_version,
        azure_endpoint=settings.azure_openai_endpoint,
    )
