# ThreatIQ Evaluation Suite

Phishing detection evaluation powered by [DeepEval](https://docs.confident-ai.com/) with Gemini-as-judge.

## Directory Structure

```
eval/
├── data/                    # Test datasets
│   ├── golden_set.json      # 40 curated examples (20 phishing + 20 safe)
│   └── sample_set.json      # 200 samples from training dataset
├── lib/                     # Support modules
│   ├── __init__.py
│   └── gemini_model.py      # DeepEval Gemini wrapper
├── tests/                   # Pytest test files
│   ├── conftest.py          # Fixtures, stub/live classifier
│   ├── test_regression.py   # Golden-set label checks + GEval quality
│   └── test_classification.py  # Accuracy benchmarks + GEval batch
├── results/                 # Git-ignored output files
├── README.md
├── EXPLAINED.md             # Beginner-friendly guide
├── requirements.txt
└── pytest.ini
```

## Quick Start

### Install
```bash
pip install -r eval/requirements.txt
```

### Run deterministic tests (no API key needed)
```bash
cd eval
pytest -k "not geval" -v
```

### Run full evaluation with LLM-judge
```bash
# Set your Gemini key
set GEMINI_API_KEY=your-key-here       # Windows
export GEMINI_API_KEY=your-key-here    # Mac/Linux

cd eval
deepeval test run tests/
```

### Live mode (against running services)
```bash
set EVAL_MODE=live
set GEMINI_API_KEY=your-key-here
cd eval
deepeval test run tests/
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EVAL_MODE` | `stub` | `stub` = heuristic; `live` = call real service |
| `GEMINI_API_KEY` | — | Required for GEval LLM-judge metrics |
| `EVAL_SERVICE_URL` | `http://localhost:8010/analyze` | Analysis service endpoint |

## Test Markers

| Marker | Description |
|--------|-------------|
| `geval` | Tests using DeepEval GEval (LLM-judge, needs `GEMINI_API_KEY`) |
| *default* | Deterministic tests (no API key needed) |

Filter: `pytest -k "not geval"` or `pytest -m "not geval"`
