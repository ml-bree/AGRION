"""Generative-UI block models served to the web dashboard.

These mirror the discriminated union in `frontend/src/components/genui/types.ts`:
each block carries a `type` literal that the frontend `GenUIRenderer` switches
on to pick a component. Field names are camelCase to match the TS contract
exactly, so the JSON serialises 1:1 with no client-side remapping.
"""

from __future__ import annotations

from typing import Literal, Union

from pydantic import BaseModel, Field


class WeatherBlock(BaseModel):
    type: Literal["weather"] = "weather"
    location: str
    forecast: str
    tempC: float
    rainChance: int  # 0-100


class FinancialYieldPoint(BaseModel):
    label: str
    # `yield` is a Python keyword, so the field is named `yield_` and aliased
    # back to `yield`. Serialise with `by_alias=True` to emit the TS key.
    yield_: float = Field(alias="yield")
    revenue: float

    model_config = {"populate_by_name": True}


class FinancialYieldBlock(BaseModel):
    type: Literal["financial_yield"] = "financial_yield"
    crop: str
    points: list[FinancialYieldPoint]


class ActionAlertBlock(BaseModel):
    type: Literal["action_alert"] = "action_alert"
    severity: Literal["info", "warning", "critical"]
    title: str
    message: str


GenUIBlock = Union[WeatherBlock, FinancialYieldBlock, ActionAlertBlock]
