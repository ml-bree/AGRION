"""Pydantic models for Africa's Talking session payloads.

Africa's Talking posts URL-encoded form fields; these models give the
controllers typed access to the incoming session state.
"""

from pydantic import BaseModel, Field


class UssdRequest(BaseModel):
    """Inbound USSD session payload."""

    session_id: str = Field(alias="sessionId")
    service_code: str = Field(alias="serviceCode")
    phone_number: str = Field(alias="phoneNumber")
    # Accumulated user input for the session, '*'-delimited. Empty on dial-in.
    text: str = Field(default="")

    model_config = {"populate_by_name": True}


class IvrRequest(BaseModel):
    """Inbound IVR/voice webhook payload."""

    session_id: str = Field(alias="sessionId")
    phone_number: str = Field(alias="callerNumber")
    is_active: str = Field(alias="isActive", default="1")
    direction: str = Field(alias="direction", default="Inbound")
    # Present on subsequent callbacks once a DTMF menu has been answered.
    dtmf_digits: str | None = Field(alias="dtmfDigits", default=None)

    model_config = {"populate_by_name": True}
