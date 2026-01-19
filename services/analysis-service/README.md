# Analysis Service

Stateless AI analysis microservice for ThreatIQ.

## Purpose

This service handles the AI analysis pipeline:
- Gemini LLM classification
- Evidence/similarity search
- Coaching response generation

## API

### POST /analyze
Analyzes a message for phishing indicators.

### GET /health
Health check endpoint.

## Running Locally

```bash
cd services/analysis-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
```

## Environment Variables

- `GEMINI_API_KEY` or `GEMINI_API_KEYS` - Gemini API key(s)

## Note

This service is stateless and does not write to any database.
All persistence is handled by the gateway-api.
