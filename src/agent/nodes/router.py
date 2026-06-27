"""Router node — domain classification for the two-step (non-USSD) path.

Runs after :mod:`intake` and writes ``domain_intent`` into state. Intent labels
and the conditional-edge function live in :mod:`triage` (the single source of
truth shared with the collapsed USSD path), so the two entry paths can never
drift on what the valid domains are or how routing resolves.
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model
from src.agent.nodes.triage import _DEFAULT_INTENT, VALID_INTENTS
from src.agent.state import DomainIntent, FarmerState

logger = logging.getLogger(__name__)

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
