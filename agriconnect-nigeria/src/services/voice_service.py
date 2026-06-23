"""ElevenLabs text-to-speech rendering with on-disk audio caching.

Generated clips are cached by a hash of (text, voice) so repeat advisories
are not re-synthesised, keeping IVR latency and API costs down.
"""

from __future__ import annotations

import hashlib
from pathlib import Path

import httpx

from config.settings import get_settings


class VoiceService:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.elevenlabs_api_key
        self._voice_id = settings.elevenlabs_voice_id
        self._base_url = settings.elevenlabs_base_url.rstrip("/")
        self._cache_dir = Path(settings.audio_cache_dir)
        self._cache_dir.mkdir(parents=True, exist_ok=True)

    def _cache_path(self, text: str) -> Path:
        digest = hashlib.sha256(
            f"{self._voice_id}:{text}".encode("utf-8")
        ).hexdigest()
        return self._cache_dir / f"{digest}.mp3"

    async def synthesize(self, text: str) -> Path:
        """Render text to an MP3 file, returning the cached path if present."""
        path = self._cache_path(text)
        if path.exists():
            return path

        url = f"{self._base_url}/text-to-speech/{self._voice_id}"
        headers = {
            "xi-api-key": self._api_key,
            "Content-Type": "application/json",
        }
        payload = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            path.write_bytes(resp.content)

        return path


voice_service = VoiceService()
