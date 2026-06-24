"""Environment-driven application configuration.

All runtime settings are loaded from environment variables (or a local `.env`
file) via Pydantic Settings, so the same image can be promoted across
environments without code changes.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    app_env: str = Field(default="development")
    log_level: str = Field(default="info")

    # Neo4j
    neo4j_uri: str = Field(default="bolt://localhost:7687")
    neo4j_user: str = Field(default="neo4j")
    neo4j_password: str = Field(default="changeme")
    neo4j_database: str = Field(default="neo4j")

    # Featherless (LLM / translation)
    featherless_api_key: str = Field(default="")
    featherless_base_url: str = Field(default="https://api.featherless.ai/v1")
    featherless_model: str = Field(
        default="meta-llama/Meta-Llama-3.1-8B-Instruct"
    )

    # ElevenLabs (text-to-speech)
    elevenlabs_api_key: str = Field(default="")
    elevenlabs_voice_id: str = Field(default="")
    elevenlabs_base_url: str = Field(default="https://api.elevenlabs.io/v1")

    # Africa's Talking
    at_username: str = Field(default="sandbox")
    at_api_key: str = Field(default="")

    # Audio cache
    audio_cache_dir: str = Field(default="./.cache/audio")

    # LangGraph agent
    checkpoint_db_path: str = Field(default="./.cache/checkpoints.sqlite")
    chroma_persist_dir: str = Field(default="./.cache/chroma")
    agronomy_pdf_dir: str = Field(default="./data/pdfs")
    embedding_model: str = Field(
        default="sentence-transformers/all-MiniLM-L6-v2"
    )


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance."""
    return Settings()
