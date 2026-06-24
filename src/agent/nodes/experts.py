"""Milestone 3 — the unconstrained specialist agents.

These nodes optimise purely for **accuracy and depth**. They know nothing about
USSD/SMS character limits — that is entirely the channel formatter's job
(Milestone 4). Each writes its full reasoning into ``expert_reasoning``.

`agronomy_expert` is the RAG showcase: it retrieves grounded context from the
ChromaDB knowledge base before reasoning. `climate_expert` and `finance_expert`
follow the same shape so the router's three branches all resolve.
"""

from __future__ import annotations

import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.agent.llm import get_chat_model
from src.agent.state import FarmerState

logger = logging.getLogger(__name__)


def _format_context(docs) -> str:
    """Join retrieved chunks with source tags for citation in reasoning."""
    blocks = []
    for i, doc in enumerate(docs, start=1):
        source = doc.metadata.get("source", "knowledge base")
        blocks.append(f"[{i}] ({source})\n{doc.page_content.strip()}")
    return "\n\n".join(blocks) if blocks else "(no documents retrieved)"


_AGRONOMY_SYSTEM = """You are a senior agronomist advising Nigerian smallholder
farmers. Using the retrieved context as your primary evidence, produce a
highly accurate, step-by-step agronomic solution to the farmer's problem.

IMPORTANT:
- Ignore character limits completely. Do not summarise for SMS or USSD.
- Reason deeply: diagnosis, root cause, then an ordered action plan.
- Ground every recommendation in the retrieved context where possible; if the
  context is silent, say so rather than inventing specifics.
- Prefer locally available, low-cost inputs suited to Nigerian conditions."""


async def agronomy_expert(state: FarmerState) -> dict:
    """RAG-grounded agronomy reasoning written into ``expert_reasoning``."""
    # Imported lazily so the graph can be built/tested without Chroma installed.
    from src.agent.rag import get_retriever

    query = f"{state.get('crop_focus') or ''} {state['user_input']}".strip()
    try:
        docs = await get_retriever(k=4).ainvoke(query)
    except Exception as exc:  # store missing/unbuilt — reason without context
        logger.warning("retrieval failed (%s); proceeding ungrounded", exc)
        docs = []

    context = _format_context(docs)
    messages = [
        SystemMessage(content=_AGRONOMY_SYSTEM),
        HumanMessage(
            content=(
                f"Crop: {state.get('crop_focus') or 'unspecified'}\n"
                f"Farmer's problem: {state['user_input']}\n\n"
                f"Retrieved context:\n{context}"
            )
        ),
    ]

    response = await get_chat_model(temperature=0.2).ainvoke(messages)
    return {"expert_reasoning": response.content.strip()}


_CLIMATE_SYSTEM = """You are an agro-climatologist for Nigerian farmers. Give a
thorough, accurate answer about weather, rainfall, forecasts, and the planting
calendar relevant to the farmer's crop and region. Ignore length limits and
focus on correctness; explain timing and risk clearly."""


async def climate_expert(state: FarmerState) -> dict:
    """Climate / weather reasoning written into ``expert_reasoning``."""
    messages = [
        SystemMessage(content=_CLIMATE_SYSTEM),
        HumanMessage(
            content=(
                f"Crop: {state.get('crop_focus') or 'unspecified'}\n"
                f"Question: {state['user_input']}"
            )
        ),
    ]
    response = await get_chat_model(temperature=0.2).ainvoke(messages)
    return {"expert_reasoning": response.content.strip()}


_FINANCE_SYSTEM = """You are an agricultural finance and markets advisor for
Nigerian smallholders. Give an accurate, practical answer about prices,
markets, selling strategy, credit, loans, subsidies, costs, and profit. Ignore
length limits; show the reasoning and any simple calculations in full."""


async def finance_expert(state: FarmerState) -> dict:
    """Finance / market reasoning written into ``expert_reasoning``."""
    messages = [
        SystemMessage(content=_FINANCE_SYSTEM),
        HumanMessage(
            content=(
                f"Crop: {state.get('crop_focus') or 'unspecified'}\n"
                f"Question: {state['user_input']}"
            )
        ),
    ]
    response = await get_chat_model(temperature=0.2).ainvoke(messages)
    return {"expert_reasoning": response.content.strip()}
