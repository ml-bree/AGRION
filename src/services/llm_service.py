"""Featherless API integration for translation.

Advisory facts are authored in English in the graph; this service translates
them into the farmer's preferred language (e.g. Hausa, Yoruba, Igbo) before
they are formatted for USSD or rendered to speech.
"""

from __future__ import annotations

import httpx

from config.settings import get_settings


class LLMService:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.featherless_api_key
        self._base_url = settings.featherless_base_url.rstrip("/")
        self._model = settings.featherless_model

    async def translate(self, text: str, target_language: str) -> str:
        """Translate text into the target language.

        Falls back to the original text if no API key is configured, so the
        service degrades gracefully in local/dev environments.
        """
        if not self._api_key:
            return text

        payload = {
            "model": self._model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are a translator for Nigerian farmers. Translate "
                        f"the user's message into {target_language}. Keep it "
                        "short, clear, and use simple words. Reply with only "
                        "the translation."
                    ),
                },
                {"role": "user", "content": text},
            ],
            "temperature": 0.2,
        }
        headers = {"Authorization": f"Bearer {self._api_key}"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self._base_url}/chat/completions",
                json=payload,
                headers=headers,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()


llm_service = LLMService()
