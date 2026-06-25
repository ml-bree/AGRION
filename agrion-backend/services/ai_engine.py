"""
Featherless AI wrapper.
Featherless exposes an OpenAI-compatible API at https://api.featherless.ai/v1
"""
import os
from openai import OpenAI

_client = None

FALLBACK_ADVICE = (
    "We could not reach the advisory engine right now. "
    "Please try again shortly or call your local extension officer."
)

# Hard cap for USSD: Africa's Talking cuts off at 182 chars per screen.
USSD_MAX_CHARS = 175


def get_client() -> OpenAI | None:
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("FEATHERLESS_API_KEY")
    if not api_key:
        print("[ai_engine] FEATHERLESS_API_KEY not set — using fallback.")
        return None

    _client = OpenAI(base_url="https://api.featherless.ai/v1", api_key=api_key)
    return _client


def build_prompt(question: str, crop_context: dict | None, language_hint: str | None) -> tuple[str, str]:
    if crop_context:
        pests = ", ".join(crop_context.get("pests") or []) or "none recorded"
        context_block = (
            f"Crop: {crop_context.get('crop')}. "
            f"Agronomic notes: {crop_context.get('notes') or 'n/a'}. "
            f"Known pests/risks: {pests}."
        )
    else:
        context_block = "No specific crop record found in the knowledge graph."

    lang_instruction = (
        f"Respond in {language_hint}." if language_hint else "Respond in simple, clear English."
    )
    system = (
        "You are Agrion, an agricultural advisor for smallholder farmers in Nigeria. "
        "Keep answers to 2-3 SHORT sentences. Be practical and specific. "
        "Suitable for reading aloud or as a single SMS. No jargon. "
        + lang_instruction
    )
    user = f"Knowledge graph context: {context_block}\n\nFarmer question: {question}"
    return system, user


def get_advice(
    question: str,
    crop_context: dict | None = None,
    language_hint: str | None = None,
    channel: str = "sms",   # NEW: "ussd" enforces hard char limit
) -> str:
    client = get_client()
    if client is None:
        return FALLBACK_ADVICE

    system, user = build_prompt(question, crop_context, language_hint)
    model = os.getenv("FEATHERLESS_MODEL", "meta-llama/Meta-Llama-3.1-8B-Instruct")

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            max_tokens=120,   # tighter — keeps USSD responses short
            temperature=0.4,
        )
        text = response.choices[0].message.content.strip()

        # Hard truncate for USSD channel — never let a long response break AT
        if channel == "ussd" and len(text) > USSD_MAX_CHARS:
            text = text[:USSD_MAX_CHARS - 1] + "…"

        return text
    except Exception as e:
        print(f"[ai_engine] Featherless call failed: {e}")
        return FALLBACK_ADVICE
