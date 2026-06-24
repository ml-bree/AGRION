"""Shared chat-model factory.

All agent nodes talk to Featherless through its OpenAI-compatible Chat
Completions API, so we reuse LangChain's ``ChatOpenAI`` with a custom base URL.
Centralising construction here keeps model id, key, and base URL in one place.
"""

from __future__ import annotations

import json
import re
from typing import Any

from langchain_openai import ChatOpenAI

from config.settings import get_settings


def get_chat_model(temperature: float = 0.2, **kwargs: Any) -> ChatOpenAI:
    """Return a ChatOpenAI client pointed at Featherless."""
    settings = get_settings()
    return ChatOpenAI(
        model=settings.featherless_model,
        base_url=settings.featherless_base_url,
        # ChatOpenAI requires a non-empty key; use a placeholder in dev so the
        # graph can be constructed even without credentials.
        api_key=settings.featherless_api_key or "sk-no-key-configured",
        temperature=temperature,
        **kwargs,
    )


_JSON_BLOCK = re.compile(r"\{.*\}", re.DOTALL)


def parse_json_object(content: str) -> dict[str, Any]:
    """Best-effort extraction of a JSON object from an LLM response.

    Models sometimes wrap JSON in prose or ```json fences; this pulls out the
    first balanced-looking object and parses it, raising ``ValueError`` only if
    nothing parseable is found.
    """
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = _JSON_BLOCK.search(content)
        if not match:
            raise ValueError(f"No JSON object found in: {content!r}")
        return json.loads(match.group(0))
