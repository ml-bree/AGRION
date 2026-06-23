"""Ingest raw JSON sources into Neo4j nodes and relationships.

Usage:
    python -m data.seed_graph

Reads the IITA rice guide and NiMet forecast files and MERGEs them into the
graph so the loader is idempotent and safe to re-run.
"""

from __future__ import annotations

import json
from pathlib import Path

from neo4j import GraphDatabase

from config.settings import get_settings

RAW_DIR = Path(__file__).parent / "raw"


def _load_json(name: str) -> dict:
    return json.loads((RAW_DIR / name).read_text(encoding="utf-8"))


def seed_rice(tx, guide: dict) -> None:
    crop = guide["crop"]
    tx.run("MERGE (:Crop {name: $crop})", crop=crop)
    for fact in guide["facts"]:
        tx.run(
            "MATCH (c:Crop {name: $crop}) "
            "MERGE (p:Practice {id: $id}) "
            "SET p.topic = $topic, p.text = $text "
            "MERGE (c)-[:HAS_PRACTICE]->(p)",
            crop=crop,
            id=fact["id"],
            topic=fact["topic"],
            text=fact["text"],
        )


def seed_forecasts(tx, data: dict) -> None:
    for fc in data["forecasts"]:
        tx.run(
            "MERGE (f:Forecast {id: $id}) "
            "SET f.region = $region, f.period = $period, "
            "f.rainfall_mm = $rainfall_mm, f.outlook = $outlook "
            "MERGE (r:Region {name: $region}) "
            "MERGE (r)-[:HAS_FORECAST]->(f)",
            id=fc["id"],
            region=fc["region"],
            period=fc["period"],
            rainfall_mm=fc["rainfall_mm"],
            outlook=fc["outlook"],
        )


def main() -> None:
    settings = get_settings()
    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )
    rice = _load_json("iita_rice_guide.json")
    forecast = _load_json("nimet_forecast.json")

    with driver.session(database=settings.neo4j_database) as session:
        session.execute_write(seed_rice, rice)
        session.execute_write(seed_forecasts, forecast)

    driver.close()
    print("Seed complete: rice guide + forecasts ingested.")


if __name__ == "__main__":
    main()
