"""Graph assembly: <entry> → expert → formatter.

`build_graph` compiles the workflow against a checkpointer. `run_turn` is a thin
helper the API layer uses to invoke the graph with the phone number as the
thread id and return the formatted, user-facing string.

The entry step branches on channel:

* USSD takes the single-call ``triage`` node (intake + routing merged), because
  the session is latency-critical and its input is short — three model calls
  per turn (triage, expert, formatter).
* Every other channel takes the richer two-call ``intake`` → ``router`` path,
  which handles longer/ambiguous voice and chat input more reliably and can
  afford the extra call — four model calls per turn.

Both paths converge on ``route_by_intent`` and share one compiled graph and
checkpointer; intent labels live in ``triage`` so the paths can't drift.
"""

from __future__ import annotations

import asyncio
import logging

from langgraph.graph import END, START, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.agent.checkpoint import thread_config
from src.agent.nodes.experts import (
    agronomy_expert,
    climate_expert,
    finance_expert,
)
from src.agent.nodes.formatter import channel_formatter
from src.agent.nodes.intake import intake_node
from src.agent.nodes.router import router_node
from src.agent.nodes.triage import route_by_intent, triage_node
from src.agent.state import ChannelType, FarmerState, initial_state

logger = logging.getLogger(__name__)


def _select_entry(state: FarmerState) -> str:
    """Pick the entry path: fast triage for USSD, intake+router for the rest."""
    return "triage" if state["channel_type"] == "ussd" else "intake"


def build_graph(checkpointer) -> CompiledStateGraph:
    """Wire and compile the multi-channel agent graph."""
    builder = StateGraph(FarmerState)

    builder.add_node("triage", triage_node)
    builder.add_node("intake", intake_node)
    builder.add_node("router", router_node)
    builder.add_node("agronomy", agronomy_expert)
    builder.add_node("climate", climate_expert)
    builder.add_node("finance", finance_expert)
    builder.add_node("formatter", channel_formatter)

    # Entry branch: USSD → fast single-call triage; others → intake → router.
    builder.add_conditional_edges(
        START,
        _select_entry,
        {"triage": "triage", "intake": "intake"},
    )
    builder.add_edge("intake", "router")

    expert_edges = {
        "agronomy": "agronomy",
        "climate": "climate",
        "finance": "finance",
    }
    # Both entry paths write domain_intent, then fan out to the matching expert.
    builder.add_conditional_edges("triage", route_by_intent, expert_edges)
    builder.add_conditional_edges("router", route_by_intent, expert_edges)

    # Every expert funnels into the formatter, then we are done.
    for expert in ("agronomy", "climate", "finance"):
        builder.add_edge(expert, "formatter")
    builder.add_edge("formatter", END)

    return builder.compile(checkpointer=checkpointer)


async def run_turn(
    graph: CompiledStateGraph,
    *,
    phone_number: str,
    user_input: str,
    channel_type: ChannelType,
    preferred_language: str = "en",
    crop_focus: str | None = None,
) -> str:
    """Run one turn and return the channel-formatted response string.

    The phone number is the checkpoint thread id, so a resumed/dropped session
    continues on the same thread.
    """
    state = initial_state(
        phone_number=phone_number,
        user_input=user_input,
        channel_type=channel_type,
        preferred_language=preferred_language,
        crop_focus=crop_focus,
    )
    result = await graph.ainvoke(state, config=thread_config(phone_number))

    # Persist the farmer's detected region (best-effort) so other channels —
    # notably the region-less MMS pipeline — can tag observations with it.
    region = result.get("region")
    if region:
        try:
            from src.services.graph_service import graph_service

            await asyncio.to_thread(
                graph_service.upsert_farmer_region, phone_number, region
            )
        except Exception as exc:  # non-critical — never fail the farmer's turn
            logger.warning("failed to persist farmer region (%s)", exc)

    return result["final_ui_response"] or ""
