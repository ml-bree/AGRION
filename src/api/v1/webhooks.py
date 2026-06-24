"""Milestone 5 — multi-channel webhook layer.

Three endpoints normalise three very different inbound payload shapes (USSD
form posts, SMS form posts, web JSON), set the correct ``channel_type``, and
invoke the *same* compiled LangGraph agent using the phone number as the
thread id. Each returns the response in the format its channel expects.

The compiled graph lives on ``app.state.agent_graph`` (set up in the FastAPI
lifespan in ``src/main.py``), so all requests share one checkpointer.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Form, Request
from fastapi.responses import PlainTextResponse, Response
from pydantic import BaseModel, Field

from src.agent.graph import run_turn

logger = logging.getLogger(__name__)

router = APIRouter()


def _graph(request: Request):
    """Fetch the compiled agent graph stored on app startup."""
    return request.app.state.agent_graph


# --------------------------------------------------------------------------- #
# USSD — Africa's Talking form POST. Response must be a 'CON '/'END ' string.
# --------------------------------------------------------------------------- #
@router.post("/webhook/ussd", response_class=PlainTextResponse)
async def ussd_webhook(
    request: Request,
    sessionId: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
) -> str:
    # The latest '*'-delimited segment is the farmer's most recent entry.
    latest = text.split("*")[-1].strip() if text else ""
    user_input = latest or "I need farming advice"

    answer = await run_turn(
        _graph(request),
        phone_number=phoneNumber,
        user_input=user_input,
        channel_type="ussd",
    )
    # 'END ' terminates the session with the formatted menu/answer.
    return f"END {answer}"


# --------------------------------------------------------------------------- #
# SMS — Africa's Talking / Twilio form POST. Return plain text (or TwiML).
# --------------------------------------------------------------------------- #
@router.post("/webhook/sms")
async def sms_webhook(
    request: Request,
    # Africa's Talking uses 'from'/'text'; Twilio uses 'From'/'Body'.
    from_at: str | None = Form(default=None, alias="from"),
    text_at: str | None = Form(default=None, alias="text"),
    from_twilio: str | None = Form(default=None, alias="From"),
    body_twilio: str | None = Form(default=None, alias="Body"),
) -> Response:
    phone = from_at or from_twilio or ""
    message = (text_at or body_twilio or "").strip()
    if not phone:
        return PlainTextResponse("Missing sender number", status_code=400)

    answer = await run_turn(
        _graph(request),
        phone_number=phone,
        user_input=message or "I need farming advice",
        channel_type="sms",
    )

    # Plain text is valid for Africa's Talking. For Twilio, wrap in TwiML:
    #   return Response(f"<Response><Message>{answer}</Message></Response>",
    #                   media_type="application/xml")
    return PlainTextResponse(answer)


# --------------------------------------------------------------------------- #
# Chatbot — web frontend JSON. Return JSON with markdown text.
# --------------------------------------------------------------------------- #
class ChatRequest(BaseModel):
    phone_number: str = Field(..., description="Stable user/thread identifier")
    message: str
    preferred_language: str = "English"
    crop_focus: str | None = None


class ChatResponse(BaseModel):
    channel: str = "chatbot"
    response: str  # markdown


@router.post("/webhook/chat", response_model=ChatResponse)
async def chat_webhook(request: Request, payload: ChatRequest) -> ChatResponse:
    answer = await run_turn(
        _graph(request),
        phone_number=payload.phone_number,
        user_input=payload.message,
        channel_type="chatbot",
        preferred_language=payload.preferred_language,
        crop_focus=payload.crop_focus,
    )
    return ChatResponse(response=answer)
