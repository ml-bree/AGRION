"""
Africa's Talking USSD webhook.

AT POSTs: sessionId, serviceCode, phoneNumber, text
  - `text` is cumulative: e.g. "1*2*yellow leaves" as user drills in.
Response must start with:
  - "CON ..."  -> keep session open
  - "END ..."  -> close session
"""
from flask import Blueprint, request, Response

from services.ai_engine import get_advice
from services.consent import has_consented, hash_phone, record_consent
from services.knowledge_graph import get_crop_context, log_farmer_query

ussd_bp = Blueprint("ussd", __name__)

CROPS = ["Maize", "Cassava", "Tomato", "Rice", "Yam"]


@ussd_bp.route("/ussd", methods=["POST"])
def ussd_callback():
    phone_number = request.values.get("phoneNumber", "")
    text = request.values.get("text", "")
    phone_hash = hash_phone(phone_number)

    steps = [s for s in text.split("*") if s != ""] if text else []

    # ── Level 0: Main menu ──────────────────────────────────────────────
    if len(steps) == 0:
        response = (
            "CON Welcome to Agrion\n"
            "1. Get crop advice\n"
            "2. Voice assistance\n"
            "3. Data privacy info"
        )

    # ── Level 1: Crop list ──────────────────────────────────────────────
    elif steps[0] == "1" and len(steps) == 1:
        options = "\n".join(f"{i + 1}. {c}" for i, c in enumerate(CROPS))
        response = f"CON Choose your crop:\n{options}"

    # ── Level 2: Ask question ───────────────────────────────────────────
    elif steps[0] == "1" and len(steps) == 2:
        if not steps[1].isdigit() or not (1 <= int(steps[1]) <= len(CROPS)):
            response = "END Invalid selection. Please dial again."
        else:
            crop = CROPS[int(steps[1]) - 1]
            response = f"CON Describe your {crop} problem\n(e.g. yellow leaves, no growth):"

    # ── Level 3: AI advice ──────────────────────────────────────────────
    elif steps[0] == "1" and len(steps) >= 3:
        if not steps[1].isdigit() or not (1 <= int(steps[1]) <= len(CROPS)):
            response = "END Invalid crop selection. Please dial again."
        else:
            crop = CROPS[int(steps[1]) - 1]
            question = "*".join(steps[2:])  # rejoin in case user typed *

            # Auto-consent for feature phones (can't show checkbox)
            if not has_consented(phone_hash):
                record_consent(phone_hash, True)

            context = get_crop_context(crop)
            # FIX: pass channel="ussd" so advice is hard-truncated to 175 chars
            advice = get_advice(question, context, channel="ussd")
            log_farmer_query(phone_hash, crop, question, channel="ussd")
            response = f"END {advice}"

    # ── Voice IVR ───────────────────────────────────────────────────────
    elif steps[0] == "2":
        response = "END We are calling you back now. Please wait for the call."
        # TODO: trigger Africa's Talking outbound call here once AT is wired

    # ── Data privacy ────────────────────────────────────────────────────
    elif steps[0] == "3":
        response = (
            "END Agrion stores only a hash of your number, never your name. "
            "Processed under NDPA 2023. Dial *384*55# and press 3 to withdraw consent."
        )

    else:
        response = "END Invalid option. Please dial the code again."

    return Response(response, mimetype="text/plain")
