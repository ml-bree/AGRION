"""Neo4j client and deterministic Cypher queries.

Queries are intentionally parameterised and read-only so responses are
predictable and safe to serve over USSD/IVR.
"""

from __future__ import annotations

from neo4j import GraphDatabase

from config.settings import get_settings


class GraphService:
    def __init__(self) -> None:
        settings = get_settings()
        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
        self._database = settings.neo4j_database

    def close(self) -> None:
        self._driver.close()

    def verify_connectivity(self) -> None:
        self._driver.verify_connectivity()

    def get_practices(self, crop: str, topic: str | None = None) -> list[dict]:
        """Return advisory practices for a crop, optionally filtered by topic."""
        cypher = (
            "MATCH (c:Crop {name: $crop})-[:HAS_PRACTICE]->(p:Practice) "
            "WHERE $topic IS NULL OR p.topic = $topic "
            "RETURN p.topic AS topic, p.text AS text "
            "ORDER BY p.topic"
        )
        with self._driver.session(database=self._database) as session:
            result = session.run(cypher, crop=crop, topic=topic)
            return [record.data() for record in result]

    def get_forecast(self, region: str) -> dict | None:
        """Return the most recent forecast for a region."""
        cypher = (
            "MATCH (f:Forecast {region: $region}) "
            "RETURN f.period AS period, f.rainfall_mm AS rainfall_mm, "
            "f.outlook AS outlook "
            "ORDER BY f.period DESC LIMIT 1"
        )
        with self._driver.session(database=self._database) as session:
            record = session.run(cypher, region=region).single()
            return record.data() if record else None


# Module-level singleton reused across requests.
graph_service = GraphService()
