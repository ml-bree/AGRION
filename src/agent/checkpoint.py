"""Milestone 1 — SQLite checkpointing keyed by phone number.

LangGraph persists a checkpoint per ``thread_id`` after every super-step. We use
the farmer's **phone number as the thread_id**, so any later inbound message —
an async SMS reply, or a re-dial after a dropped USSD session — resumes exactly
where the previous turn left off.

This builds on LangGraph's official ``AsyncSqliteSaver`` (correct serde and
write semantics) and adds farmer-centric helpers (`resume_session`,
`has_session`) plus the phone-number thread-config convention. To swap to Redis,
replace `PhoneThreadSqliteSaver` with `AsyncRedisSaver` from
`langgraph-checkpoint-redis`; the helper surface stays identical.
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator, Optional

from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.base import CheckpointTuple
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

from config.settings import get_settings


def thread_config(phone_number: str) -> RunnableConfig:
    """Return the LangGraph config that scopes a run to one farmer's thread."""
    return {"configurable": {"thread_id": phone_number}}


class PhoneThreadSqliteSaver(AsyncSqliteSaver):
    """`AsyncSqliteSaver` that resumes farmer sessions by phone number."""

    async def resume_session(
        self, phone_number: str
    ) -> Optional[CheckpointTuple]:
        """Return the latest checkpoint for a phone number, or ``None``.

        Use this to decide whether an inbound message continues an existing
        conversation (e.g. a dropped USSD session) or starts a new one.
        """
        return await self.aget_tuple(thread_config(phone_number))

    async def has_session(self, phone_number: str) -> bool:
        """True if any checkpoint already exists for this phone number."""
        return (await self.resume_session(phone_number)) is not None


@asynccontextmanager
async def open_checkpointer() -> AsyncIterator[PhoneThreadSqliteSaver]:
    """Open (and lazily create) the SQLite-backed checkpoint saver.

    Intended to wrap the app lifetime: open once at startup, compile the graph
    with the yielded saver, and keep it for the process duration.
    """
    settings = get_settings()
    db_path = Path(settings.checkpoint_db_path)
    db_path.parent.mkdir(parents=True, exist_ok=True)

    async with PhoneThreadSqliteSaver.from_conn_string(str(db_path)) as saver:
        await saver.setup()  # idempotent: creates tables/indexes if absent
        yield saver
