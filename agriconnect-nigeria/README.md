# AgriConnect Nigeria

A USSD and IVR farming advisory service for Nigerian smallholder farmers.
Advisory content lives in a **Neo4j knowledge graph** (sourced from IITA guides
and NiMet forecasts), is translated to local languages via **Featherless**, and
rendered to voice via **ElevenLabs** — all reachable from any basic phone over
**Africa's Talking**.

## Architecture

```
Farmer's phone
   │  USSD  / Voice
   ▼
Africa's Talking gateway
   │  HTTP webhook
   ▼
FastAPI (src/main.py)
   ├── /api/v1/ussd   → ussd.py   ─┐
   └── /api/v1/voice  → ivr.py    ─┤
                                   ▼
        ┌──────────────────────────────────────────┐
        │ graph_service  → Neo4j (deterministic     │
        │                  Cypher: practices, forecast)
        │ llm_service    → Featherless (translation) │
        │ voice_service  → ElevenLabs (TTS + cache)  │
        │ text_formatter → 160-char USSD shaping     │
        └──────────────────────────────────────────┘
```

- **USSD** is stateless: Africa's Talking replays the full `*`-delimited input
  on every request, and `ussd.py` derives menu position from that text.
- **IVR** returns Africa's Talking XML; the first callback plays a DTMF menu and
  later callbacks carry the pressed digit.
- Graph queries are parameterised and read-only, so responses are deterministic
  and safe to serve at telecom latency.

## Project layout

| Path | Purpose |
|------|---------|
| `config/settings.py` | Env-driven config (Pydantic Settings) |
| `config/neo4j_constraints.cypher` | Constraints & indexes |
| `data/raw/*.json` | Structured IITA / NiMet source facts |
| `data/seed_graph.py` | Idempotent JSON → Neo4j loader |
| `src/api/v1/ussd.py` | USSD webhook controller |
| `src/api/v1/ivr.py` | IVR/voice webhook controller |
| `src/api/schemas/telecom.py` | Inbound session payload models |
| `src/services/` | Graph, LLM, and voice integrations |
| `src/utils/text_formatter.py` | USSD 160-char formatting |
| `tests/` | Route + graph query tests |

## Setup

```bash
# 1. Install dependencies
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# 2. Configure environment
cp .env.example .env   # then fill in Neo4j / Featherless / ElevenLabs keys

# 3. Prepare the graph (Neo4j must be running)
cat config/neo4j_constraints.cypher | cypher-shell -u neo4j -p <password>
python -m data.seed_graph

# 4. Run the API
uvicorn src.main:app --reload
```

Health check: `GET http://localhost:8000/health`

## Webhooks

Point your Africa's Talking application at:

- **USSD callback:** `POST https://<host>/api/v1/ussd`
- **Voice callback:** `POST https://<host>/api/v1/voice`

## Testing

```bash
pytest tests/ -v
```

Route and schema tests mock the graph service and run anywhere. The graph
integration tests in `test_graph_queries.py` self-skip when no Neo4j instance
is reachable.

## Deployment

```bash
docker build -t agriconnect-nigeria .
docker run -p 8000:8000 --env-file .env agriconnect-nigeria
```
