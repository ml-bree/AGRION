"""Generative-UI streaming controller for the web dashboard.

The frontend `useGenUI` hook opens `GET /api/v1/genui/{session_id}` and reads a
newline-delimited JSON (NDJSON) stream, rendering each block as it arrives. This
controller assembles blocks from the knowledge graph and yields them one per
line.

Blocks are emitted progressively (rather than as one JSON array) so the client
can paint the first card without waiting for the whole advisory to assemble.
"""

from __future__ import annotations

from collections.abc import AsyncIterator

from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse

from src.api.schemas.genui import (
    ActionAlertBlock,
    FinancialYieldBlock,
    FinancialYieldPoint,
    GenUIBlock,
    WeatherBlock,
)
from src.services.graph_service import graph_service

router = APIRouter()

NDJSON_MEDIA_TYPE = "application/x-ndjson"


def _build_blocks(region: str, crop: str) -> list[GenUIBlock]:
    """Assemble dashboard blocks from graph data for a region/crop."""
    blocks: list[GenUIBlock] = []

    forecast = graph_service.get_forecast(region)
    if forecast:
        # The graph carries rainfall + outlook but not temperature yet, so
        # `tempC` is left as a neutral placeholder until NiMet temps are seeded.
        blocks.append(
            WeatherBlock(
                location=region,
                forecast=f"{forecast['period']}: {forecast['outlook']}",
                tempC=0.0,
                rainChance=min(100, int(forecast["rainfall_mm"])),
            )
        )

    practices = graph_service.get_practices(crop)
    if practices:
        # Surface the first practice as an actionable alert.
        first = practices[0]
        blocks.append(
            ActionAlertBlock(
                severity="info",
                title=f"{crop}: {first['topic']}",
                message=first["text"],
            )
        )

    # Financial/yield projections are not in the graph yet; emit an empty-series
    # block so the chart component renders its frame. Wire real figures here once
    # a market-price / yield source is seeded.
    blocks.append(
        FinancialYieldBlock(
            crop=crop,
            points=[
                FinancialYieldPoint(label="Season", yield_=0.0, revenue=0.0),
            ],
        )
    )

    return blocks


async def _stream_blocks(region: str, crop: str) -> AsyncIterator[bytes]:
    for block in _build_blocks(region, crop):
        line = block.model_dump_json(by_alias=True)
        yield f"{line}\n".encode()


@router.get("/genui/{session_id}")
async def genui_stream(
    session_id: str,
    region: str = Query(default="Kano"),
    crop: str = Query(default="Rice"),
) -> StreamingResponse:
    # `session_id` is reserved for per-farmer personalisation (saved region,
    # crops, language) once sessions are persisted; ignored for now.
    _ = session_id
    return StreamingResponse(
        _stream_blocks(region.title(), crop.title()),
        media_type=NDJSON_MEDIA_TYPE,
    )
