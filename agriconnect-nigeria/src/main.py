"""FastAPI application entrypoint for AgriConnect Nigeria.

Wires up the USSD and IVR webhook controllers that Africa's Talking calls,
plus a lightweight health check for deployment probes.
"""

import logging

from fastapi import FastAPI

from config.settings import get_settings
from src.api.v1 import ivr, ussd

settings = get_settings()
logging.basicConfig(level=settings.log_level.upper())

app = FastAPI(
    title="AgriConnect Nigeria",
    description=(
        "USSD and IVR farming advisory powered by a Neo4j knowledge graph, "
        "Featherless translation, and ElevenLabs voice."
    ),
    version="0.1.0",
)

app.include_router(ussd.router, prefix="/api/v1", tags=["ussd"])
app.include_router(ivr.router, prefix="/api/v1", tags=["ivr"])


@app.get("/health", tags=["system"])
async def health() -> dict[str, str]:
    return {"status": "ok", "env": settings.app_env}
