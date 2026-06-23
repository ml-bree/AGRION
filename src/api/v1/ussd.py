"""Africa's Talking USSD webhook controller.

USSD is stateless on the gateway side: the full '*'-delimited input history is
replayed on every request, so the controller derives the current menu position
from that text rather than from server-side session storage.
"""

from fastapi import APIRouter, Form
from fastapi.responses import PlainTextResponse

from src.services.graph_service import graph_service
from src.utils.text_formatter import menu, truncate_for_ussd

router = APIRouter()

# Crops exposed on the main menu, in display order.
CROPS = ["Rice"]


def _con(text: str) -> str:
    """Continue the session (gateway expects a 'CON ' prefix)."""
    return f"CON {text}"


def _end(text: str) -> str:
    """End the session (gateway expects an 'END ' prefix)."""
    return f"END {truncate_for_ussd(text)}"


@router.post("/ussd", response_class=PlainTextResponse)
async def ussd_handler(
    sessionId: str = Form(...),
    serviceCode: str = Form(...),
    phoneNumber: str = Form(...),
    text: str = Form(default=""),
) -> str:
    steps = [s for s in text.split("*") if s != ""]

    # Level 0: welcome / crop selection.
    if not steps:
        return _con(menu("Welcome to AgriConnect", CROPS + ["Forecast"]))

    choice = steps[0]

    # Forecast branch.
    if choice == str(len(CROPS) + 1):
        if len(steps) == 1:
            return _con("Enter your region (e.g. Kano):")
        forecast = graph_service.get_forecast(steps[1].strip().title())
        if not forecast:
            return _end("No forecast available for that region.")
        return _end(
            f"{forecast['period']}: {forecast['outlook']} "
            f"({forecast['rainfall_mm']}mm)"
        )

    # Crop advisory branch.
    try:
        crop = CROPS[int(choice) - 1]
    except (ValueError, IndexError):
        return _end("Invalid selection.")

    practices = graph_service.get_practices(crop)
    if not practices:
        return _end(f"No advice available for {crop} yet.")

    if len(steps) == 1:
        topics = [p["topic"] for p in practices]
        return _con(menu(f"{crop} advice", topics))

    try:
        practice = practices[int(steps[1]) - 1]
    except (ValueError, IndexError):
        return _end("Invalid selection.")

    return _end(practice["text"])
