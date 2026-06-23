// Database constraints and indexes for AgriConnect Nigeria.
// Run once against a fresh Neo4j instance:
//   cat config/neo4j_constraints.cypher | cypher-shell -u neo4j -p <password>

// ── Uniqueness constraints (also create backing indexes) ────────────
CREATE CONSTRAINT crop_name IF NOT EXISTS
FOR (c:Crop) REQUIRE c.name IS UNIQUE;

CREATE CONSTRAINT region_name IF NOT EXISTS
FOR (r:Region) REQUIRE r.name IS UNIQUE;

CREATE CONSTRAINT practice_id IF NOT EXISTS
FOR (p:Practice) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT pest_name IF NOT EXISTS
FOR (p:Pest) REQUIRE p.name IS UNIQUE;

CREATE CONSTRAINT forecast_id IF NOT EXISTS
FOR (f:Forecast) REQUIRE f.id IS UNIQUE;

// ── Lookup indexes ──────────────────────────────────────────────────
CREATE INDEX crop_season IF NOT EXISTS
FOR (c:Crop) ON (c.season);

CREATE INDEX forecast_region IF NOT EXISTS
FOR (f:Forecast) ON (f.region);
