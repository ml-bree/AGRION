"""Milestone 2, Node 1 — the Intake Agent.

A lightweight pass that (a) detects the farmer's language while tolerating
code-switching (Nigerian Pidgin mixed with English/Hausa/Yoruba/Igbo) and
(b) extracts the core crop entity. It deliberately does *not* answer the
question — it only enriches state for the router and experts downstream.
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model, parse_json_object
from src.agent.state import FarmerState

logger = logging.getLogger(__name__)

_SYSTEM = """You are the intake agent for a Nigerian farming advisory service.
Farmers write in English, Hausa, Yoruba, Igbo, or Nigerian Pidgin, and often
code-switch within a single message.

From the farmer's message, determine:
1. preferred_language: the dominant language to reply in. Use one of:
   "English", "Hausa", "Yoruba", "Igbo", "Pidgin". If a message mixes Pidgin
   and English, prefer "Pidgin".
2. crop_focus: the single crop the farmer is asking about (e.g. "Rice",
   "Maize", "Cassava", "Tomato"). Use null if no crop is mentioned.

Reply with ONLY a JSON object:
{"preferred_language": "...", "crop_focus": "..." or null}"""


async def intake_node(state: FarmerState) -> dict:
    """Detect language and extract the crop entity from ``user_input``."""
    model = get_chat_model(temperature=0.0)
    messages = [
        SystemMessage(content=_SYSTEM),
        HumanMessage(content=state["user_input"]),
    ]

    try:
        response = await model.ainvoke(messages)
        parsed = parse_json_object(response.content)
        language = (parsed.get("preferred_language") or "").strip()
        crop = parsed.get("crop_focus")
        crop = crop.strip().title() if isinstance(crop, str) and crop else None
    except (ValueError, KeyError) as exc:
        # Degrade gracefully: keep the caller-supplied language, no crop.
        logger.warning("intake parse failed (%s); using defaults", exc)
        language, crop = "", None

    update: dict = {}
    # Only overwrite the language if intake actually detected one; otherwise
    # respect whatever the channel/API layer already set.
    if language:
        update["preferred_language"] = language
    if crop:
        update["crop_focus"] = crop
    return update
