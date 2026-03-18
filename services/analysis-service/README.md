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

## ML Pipeline

An offline, reproducible ML training pipeline lives under `ml/`:

```bash
cd ml
python train_classifier.py --max_features 5000 --C 1.0   # Train
python evaluate_classifier.py                              # Evaluate on test set
```

- **Model**: TF-IDF + Logistic Regression (baseline F1: 0.98)
- **Dataset**: `data/phishing_dataset.csv` (2,000 samples, balanced)
- **Artifacts**: Saved to `ml/artifacts/` (`.gitignored`)
- **Tracking**: Each run auto-logged to `ml/experiment_log.csv`
- **Error Analysis**: Documented in `ml/error_analysis.md`

See [`ml/README.md`](ml/README.md) for full details.

## Note

This service is stateless and does not write to any database.
All persistence is handled by the gateway-api.
