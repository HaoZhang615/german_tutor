from app.models import GermanLevel

GERMAN_LEVELS: dict[str, GermanLevel] = {
    "A1": GermanLevel(
        code="A1",
        name="Beginner",
        name_zh="初级",
        name_de="Anfänger",
        description="Basic phrases and simple vocabulary for everyday situations",
        description_zh="日常基础短语和简单词汇",
        description_de="Grundlegende Phrasen und einfacher Wortschatz für Alltagssituationen",
    ),
    "A2": GermanLevel(
        code="A2",
        name="Elementary",
        name_zh="初中级",
        name_de="Grundlegende Kenntnisse",
        description="Simple conversations about familiar topics and routine tasks",
        description_zh="关于熟悉话题的简单对话和日常任务",
        description_de="Einfache Gespräche über vertraute Themen und Routineaufgaben",
    ),
    "B1": GermanLevel(
        code="B1",
        name="Intermediate",
        name_zh="中级",
        name_de="Fortgeschrittene Sprachverwendung",
        description="Handle most travel situations and discuss familiar matters",
        description_zh="处理大多数旅行情况，讨论熟悉的事务",
        description_de="Die meisten Reisesituationen bewältigen und vertraute Themen besprechen",
    ),
    "B2": GermanLevel(
        code="B2",
        name="Upper Intermediate",
        name_zh="中高级",
        name_de="Selbständige Sprachverwendung",
        description="Complex discussions on abstract and technical topics",
        description_zh="关于抽象和技术话题的复杂讨论",
        description_de="Komplexe Diskussionen über abstrakte und technische Themen",
    ),
    "C1": GermanLevel(
        code="C1",
        name="Advanced",
        name_zh="高级",
        name_de="Fachkundige Sprachkenntnisse",
        description="Fluent expression for academic and professional purposes",
        description_zh="学术和专业目的的流利表达",
        description_de="Fließende Ausdrucksfähigkeit für akademische und berufliche Zwecke",
    ),
    "C2": GermanLevel(
        code="C2",
        name="Mastery",
        name_zh="精通",
        name_de="Annähernd muttersprachliche Kenntnisse",
        description="Near-native level with subtle nuances and complex expressions",
        description_zh="接近母语水平，掌握细微差别和复杂表达",
        description_de="Nahezu muttersprachliches Niveau mit feinen Nuancen und komplexen Ausdrücken",
    ),
}


def get_system_prompt(level: str, ui_language: str = "en") -> str:
    level_info = GERMAN_LEVELS.get(level, GERMAN_LEVELS["A1"])

    base_instructions = {
        "A1": "Use only the most basic German words and very short sentences. Speak slowly and clearly. Repeat key words. Use only present tense. Limit vocabulary to about 500 most common words.",
        "A2": "Use simple German sentences and basic grammar. Include common everyday vocabulary. Use present and simple past tense. Speak at a moderate pace. Vocabulary around 1000 words.",
        "B1": "Use standard German with varied sentence structures. Include conditional sentences and different tenses. Discuss everyday topics, travel, work, and hobbies naturally.",
        "B2": "Use complex German with idiomatic expressions. Discuss abstract topics, current events, and specialized subjects. Include subjunctive mood and advanced grammar.",
        "C1": "Use sophisticated German with nuanced vocabulary. Discuss academic and professional topics in depth. Include subtle language variations and advanced rhetorical devices.",
        "C2": "Use native-level German with all linguistic nuances. Include regional expressions, wordplay, and the full range of German linguistic features. Engage in any topic at the highest level.",
    }

    language_bridge = {
        "en": "If the student struggles, you may briefly explain in English, but always return to German practice.",
        "zh": "If the student struggles, you may briefly explain in Chinese (简体中文), but always return to German practice.",
        "de": "Bleiben Sie durchgehend auf Deutsch. Vereinfachen Sie bei Bedarf, aber wechseln Sie nicht die Sprache.",
    }

    return f"""You are a friendly and patient German language tutor helping a Chinese student who also speaks English fluently.

Current German Level: {level_info.code} ({level_info.name})
Level Description: {level_info.description}

Teaching Guidelines:
{base_instructions.get(level, base_instructions["A1"])}

{language_bridge.get(ui_language, language_bridge["en"])}

Conversation Style:
- Be encouraging but strict about correctness
- IMMEDIATELY correct ALL grammar mistakes, spelling errors, and awkward phrasing
- For every error: state the mistake, provide the correct form, and briefly explain why
- Suggest better wording even when the student's response is technically correct but could be more natural or idiomatic
- Provide context and cultural insights when relevant
- Ask follow-up questions to keep the conversation going
- Adjust difficulty based on student's responses
- Focus on practical, real-world German usage

Correction Format:
When correcting, use this pattern:
❌ [Student's error] → ✅ [Correct form] - [Brief explanation]

Start by greeting the student warmly in German appropriate for their level and asking what they would like to practice today."""
