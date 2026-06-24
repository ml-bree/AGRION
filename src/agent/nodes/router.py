"""Milestone 2, Node 2 — the Router Agent + conditional edge.

An LLM classifier maps the farmer's request to one of three specialist domains.
`router_node` writes `domain_intent` into state; `route_by_intent` is the
LangGraph conditional-edge function that turns that label into the next node.
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model
from src.agent.state import DomainIntent, FarmerState

logger = logging.getLogger(__name__)

VALID_INTENTS: tuple[DomainIntent, ...] = ("agronomy", "climate", "finance")
_DEFAULT_INTENT: DomainIntent = "agronomy"

_SYSTEM = """You route a Nigerian farmer's question to one specialist.
Choose exactly one label:

- agronomy: planting, pests, disease, fertiliser, soil, seeds, harvest, yield.
- climate: weather, rainfall, forecast, drought, flooding, planting calendar.
- finance: prices, markets, selling, loans, credit, subsidies, profit, costs.

Reply with ONLY the single lowercase label: agronomy, climate, or finance."""


async def router_node(state: FarmerState) -> dict:
    """Classify the request into agronomy / climate / finance."""
    model = get_chat_model(temperature=0.0)
    crop = state.get("crop_focus") or "unspecified crop"
    messages = [
        SystemMessage(content=_SYSTEM),
        HumanMessage(content=f"Crop: {crop}\nQuestion: {state['user_input']}"),
    ]

    response = await model.ainvoke(messages)
    label = response.content.strip().lower()

    intent: DomainIntent = (
        label if label in VALID_INTENTS else _DEFAULT_INTENT  # type: ignore[assignment]
    )
    if label not in VALID_INTENTS:
        logger.warning("router got %r; defaulting to %s", label, intent)

    return {"domain_intent": intent}


def route_by_intent(state: FarmerState) -> DomainIntent:
    """Conditional-edge function: pick the expert node from `domain_intent`."""
    intent = state.get("domain_intent")
    if intent in VALID_INTENTS:
        return intent  # type: ignore[return-value]
    return _DEFAULT_INTENT
