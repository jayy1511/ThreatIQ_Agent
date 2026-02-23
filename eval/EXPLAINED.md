# ThreatIQ Evaluation Pipeline — Explained

## What Is This?

The `eval/` folder is a **testing system for your AI phishing detector**. Think of it like a "grade checker" — it feeds your AI system a bunch of messages (some phishing, some safe) and checks if the AI gets the answers right.

This is important for your FYP because it gives you **measurable proof** that your system works.

---

## Why Do We Need It?

Without evaluation, you can only say _"my AI seems to work"_. With evaluation, you can say:

> "My system correctly identifies phishing messages **92% of the time**, with a **0.89 F1 score**, and responds in under **200ms**."

That's what professors and reviewers want to see — **numbers**.

---

## How Does It Work?

### The Big Picture

```
Test Data (JSON files)
        |
        v
   Classifier (stub or live AI)
        |
        v
   DeepEval (pytest framework)
        |
        v
   Results: PASS / FAIL + scores
```

### Step by Step

1. **We have test data** — messages we already know the correct answer for
2. **We feed each message** to either the real AI service or a simple keyword-based heuristic
3. **We check the results** — did the AI get the right answer?
4. **We report scores** — accuracy, precision, recall, etc.

---

## What's In Each File?

### Data Files (the test questions)

| File | What It Contains |
|------|-----------------|
| `golden_set.json` | **40 hand-picked examples** (20 phishing + 20 safe). These are carefully chosen to test specific scenarios like Nigerian prince scams, fake bank alerts, legitimate newsletters, etc. |
| `sample_set.json` | **200 random examples** pulled from the real training dataset. A broader, more diverse test. |

### Test Files (the test runner)

| File | What It Does |
|------|-------------|
| `test_regression.py` | Runs all 40 golden-set items and checks: **did the AI get each one right?** Every single item must match. This catches bugs — if a code change suddenly breaks something, this test fails. |
| `test_classification.py` | Runs the 200-item sample set and checks **overall accuracy** (must be above a threshold). Also includes LLM-judge tests where Gemini evaluates the quality of explanations. |

### Support Files (the plumbing)

| File | What It Does |
|------|-------------|
| `conftest.py` | **Shared setup code** — loads the test data, contains the keyword-based heuristic classifier (for testing without running the real AI), and a function that routes to either the real service or the heuristic based on your settings. |
| `gemini_model.py` | **Gemini wrapper** — connects DeepEval to Google's Gemini AI so it can be used as a "judge" to evaluate response quality (not just right/wrong, but _how good_ the explanation is). |
| `requirements.txt` | Python packages needed: `deepeval` (the testing framework) and `google-genai` (Gemini SDK). |
| `pytest.ini` | Configuration for pytest (tells it about our custom test markers). |

---

## Two Modes

### Stub Mode (no API key needed)
Uses a **keyword heuristic** — a simple algorithm that checks for words like "urgent", "verify your account", "click here", etc. It's not smart, but it lets you run tests instantly without any services running.

```bash
pytest eval/ -k "not geval" -v
```

### Live Mode (needs services running)
Calls your **actual AI analysis service** (the one with Gemini). This gives real results that measure your actual system's performance.

```bash
EVAL_MODE=live pytest eval/ -v
```

---

## What Is DeepEval?

[DeepEval](https://docs.confident-ai.com/) is an open-source framework — basically **"pytest but for AI systems"**. It adds special capabilities:

- **GEval** — Uses an LLM (Gemini in our case) as a "judge" to score your AI's outputs. Instead of just checking "phishing or safe?", it also evaluates: _"Is the explanation helpful? Does it mention specific red flags?"_
- **Test Cases** — Structured format for comparing expected vs actual AI outputs
- **CI Integration** — Runs automatically in GitHub Actions on every push

---

## Key Metrics (What the Numbers Mean)

| Metric | Plain English |
|--------|--------------|
| **Accuracy** | Out of all messages, what % did the AI get right? |
| **Precision** | When the AI says "phishing", how often is it actually phishing? (Low = too many false alarms) |
| **Recall** | Out of all actual phishing messages, how many did the AI catch? (Low = missed threats) |
| **F1 Score** | A combined score of precision + recall. Higher = better balance. |

### Example
If your system has:
- **Precision 95%** → Almost no false alarms
- **Recall 80%** → Catches 80% of phishing, misses 20%
- **F1 = 87%** → Good overall balance

---

## How to Run It

### Quick test (no setup needed)
```bash
cd ThreatIQ_Agent
pip install -r eval/requirements.txt
pytest eval/ -k "not geval" -v
```

### Full test with AI judgment
```bash
# Set your Gemini API key
export GEMINI_API_KEY=your-key-here    # Mac/Linux
set GEMINI_API_KEY=your-key-here       # Windows

# Run everything including LLM-judge tests
deepeval test run eval/
```

### Test against your real running services
```bash
# Make sure services are running first:
# Terminal 1: cd services/analysis-service && uvicorn app.main:app --port 8010
# Terminal 2: cd backend && uvicorn app.main:app --port 8000

# Then run evaluation in live mode
set EVAL_MODE=live
set GEMINI_API_KEY=your-key-here
deepeval test run eval/
```

---

## In CI (GitHub Actions)

The CI workflow automatically:
1. Installs eval dependencies
2. Runs deterministic tests (no API key needed) — **always runs**
3. Runs GEval LLM-judge tests — **only if `GEMINI_API_KEY` is set as a GitHub secret**

This means CI will never fail just because you don't have a key set up.
