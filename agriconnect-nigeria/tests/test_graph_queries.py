"""Graph query tests.

Marked as integration tests because they require a live Neo4j instance with
the seed data loaded. Skipped automatically when connectivity is unavailable.
"""

import time

import pytest

from src.services.graph_service import GraphService


@pytest.fixture(scope="module")
def graph():
    service = GraphService()
    try:
        service.verify_connectivity()
    except Exception:
        pytest.skip("Neo4j not available; skipping integration tests.")
    yield service
    service.close()


def test_get_practices_returns_rows(graph):
    rows = graph.get_practices("Rice")
    assert isinstance(rows, list)
    if rows:
        assert {"topic", "text"} <= rows[0].keys()


def test_get_practices_is_fast(graph):
    start = time.perf_counter()
    graph.get_practices("Rice")
    elapsed = time.perf_counter() - start
    # Deterministic lookups should stay well under USSD timeout budgets.
    assert elapsed < 1.0


def test_get_forecast_shape(graph):
    forecast = graph.get_forecast("Kano")
    if forecast is not None:
        assert {"period", "rainfall_mm", "outlook"} <= forecast.keys()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
