"""Africa's Talking IVR/Voice webhook controller.

Returns Africa's Talking XML responses. The first callback plays a DTMF menu;
subsequent callbacks carry the pressed digit and play the matching advisory,
synthesised (and cached) by the voice service.
"""

from fastapi import APIRouter, Form
from fastapi.responses import Response

from src.services.graph_service import graph_service

router = APIRouter()

# Map DTMF digits to (crop) advisories surfaced over voice.
CROP_BY_DIGIT = {"1": "Rice"}


def _xml(body: str) -> Response:
    return Response(
        content=f'<?xml version="1.0" encoding="UTF-8"?><Response>{body}</Response>',
        media_type="application/xml",
    )


@router.post("/voice")
async def voice_handler(
    isActive: str = Form(default="1"),
    dtmfDigits: str | None = Form(default=None),
) -> Response:
    # Call ended / hung up.
    if isActive == "0":
        return _xml("")

    # First callback: present the DTMF menu.
    if not dtmfDigits:
        return _xml(
            '<GetDigits numDigits="1" timeout="10">'
            "<Say>Welcome to AgriConnect. "
            "For rice advice, press 1.</Say>"
            "</GetDigits>"
        )

    crop = CROP_BY_DIGIT.get(dtmfDigits)
    if not crop:
        return _xml("<Say>Sorry, that option is not available. Goodbye.</Say>")

    practices = graph_service.get_practices(crop)
    if not practices:
        return _xml(f"<Say>No advice available for {crop} yet. Goodbye.</Say>")

    spoken = ". ".join(p["text"] for p in practices[:3])
    return _xml(f"<Say>{spoken}</Say>")
