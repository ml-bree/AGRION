"""USSD route tests.

The graph service is mocked so the tests verify menu state tracking and the
CON/END session protocol without needing a live Neo4j instance.
"""

from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)

FAKE_PRACTICES = [
    {"topic": "Land Preparation", "text": "Plough and level the field."},
    {"topic": "Spacing", "text": "Transplant at 20cm by 20cm."},
]


def _post(text: str):
    return client.post(
        "/api/v1/ussd",
        data={
            "sessionId": "s1",
            "serviceCode": "*384#",
            "phoneNumber": "+2348000000000",
            "text": text,
        },
    )


def test_welcome_menu_on_dial_in():
    resp = _post("")
    assert resp.status_code == 200
    assert resp.text.startswith("CON ")
    assert "Welcome to AgriConnect" in resp.text


@patch("src.api.v1.ussd.graph_service")
def test_crop_selection_lists_topics(mock_graph):
    mock_graph.get_practices.return_value = FAKE_PRACTICES
    resp = _post("1")
    assert resp.text.startswith("CON ")
    assert "Land Preparation" in resp.text
    assert "Spacing" in resp.text


@patch("src.api.v1.ussd.graph_service")
def test_topic_selection_ends_with_advice(mock_graph):
    mock_graph.get_practices.return_value = FAKE_PRACTICES
    resp = _post("1*1")
    assert resp.text.startswith("END ")
    assert "Plough" in resp.text


def test_invalid_crop_selection_ends_session():
    resp = _post("9")
    assert resp.text.startswith("END ")
    assert "Invalid" in resp.text


@patch("src.api.v1.ussd.graph_service")
def test_forecast_branch(mock_graph):
    mock_graph.get_forecast.return_value = {
        "period": "2026-06",
        "rainfall_mm": 110,
        "outlook": "Onset of steady rains.",
    }
    resp = _post("2*Kano")
    assert resp.text.startswith("END ")
    assert "110mm" in resp.text


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
