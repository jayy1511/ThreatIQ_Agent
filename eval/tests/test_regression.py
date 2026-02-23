"""
ThreatIQ Evaluation – Regression Tests

Deterministic label-match checks over the golden set (no API key needed),
plus DeepEval GEval quality checks (requires GEMINI_API_KEY).

Run deterministic only:   pytest eval/tests/test_regression.py -k "not geval"
Run all (with Gemini):    deepeval test run eval/tests/
"""

from __future__ import annotations

import json
import time
import pytest
from pathlib import Path

EVAL_DIR = Path(__file__).resolve().parent.parent  # eval/
DATA_DIR = EVAL_DIR / "data"


# ──────────────────────────────────────────────
# Load golden set for parametrize
# ──────────────────────────────────────────────

def _load_golden():
    with open(DATA_DIR / "golden_set.json", "r", encoding="utf-8") as f:
        return json.load(f)


GOLDEN_ITEMS = _load_golden()
GOLDEN_IDS = [item["id"] for item in GOLDEN_ITEMS]


# ──────────────────────────────────────────────
# Deterministic: label match (no API key)
# ──────────────────────────────────────────────

@pytest.mark.parametrize("item", GOLDEN_ITEMS, ids=GOLDEN_IDS)
def test_label_match(item, classify_fn):
    """Predicted label must match expected label."""
    result = classify_fn(item["text"])
    assert result["label"].lower() == item["label"].lower(), (
        f"Expected '{item['label']}', got '{result['label']}' "
        f"for {item['id']}: {item['text'][:60]}..."
    )


# ──────────────────────────────────────────────
# DeepEval GEval: explanation quality (needs key)
# ──────────────────────────────────────────────

@pytest.mark.geval
def test_geval_explanation_quality(golden_set, classify_fn):
    """Use DeepEval GEval to judge explanation quality on a sample of golden items."""
    import os
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set -- skipping LLM-judge test")

    from deepeval import assert_test
    from deepeval.test_case import LLMTestCase, LLMTestCaseParams
    from deepeval.metrics import GEval
    from lib.gemini_model import GeminiModel

    model = GeminiModel()

    explanation_metric = GEval(
        name="Explanation Quality",
        criteria=(
            "Evaluate whether the explanation correctly identifies why the message "
            "is phishing or safe. The explanation should be specific, educational, "
            "and mention concrete signals (e.g. urgency, suspicious links, "
            "impersonation) rather than being vague."
        ),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
        ],
        model=model,
        threshold=0.5,
    )

    # Test a small subset to minimize API calls (free tier friendly)
    for i, item in enumerate(golden_set[:3]):
        if i > 0:
            time.sleep(5)  # Stay under Gemini free-tier 15 RPM
        result = classify_fn(item["text"])
        test_case = LLMTestCase(
            input=item["text"],
            actual_output=(
                f"Classification: {result['label']} "
                f"(confidence: {result['confidence']}). "
                f"Reason tags: {result['reason_tags']}. "
                f"Explanation: {result['explanation']}"
            ),
            expected_output=(
                f"This message is {item['label']}. "
                f"Key indicators: {', '.join(item.get('expected_reason_tags', []))}"
            ),
        )
        explanation_metric.measure(test_case)
        assert explanation_metric.score >= explanation_metric.threshold, (
            f"{item['id']}: explanation quality {explanation_metric.score:.2f} "
            f"< {explanation_metric.threshold} -- {explanation_metric.reason}"
        )


# ──────────────────────────────────────────────
# DeepEval GEval: classification correctness
# ──────────────────────────────────────────────

@pytest.mark.geval
def test_geval_classification_correctness(golden_set, classify_fn):
    """LLM-judge: is the classification decision correct and well-reasoned?"""
    import os
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set -- skipping LLM-judge test")

    from deepeval import assert_test
    from deepeval.test_case import LLMTestCase, LLMTestCaseParams
    from deepeval.metrics import GEval
    from lib.gemini_model import GeminiModel

    model = GeminiModel()

    correctness_metric = GEval(
        name="Classification Correctness",
        criteria=(
            "Determine if the phishing/safe classification is correct. "
            "The actual output should agree with the expected output on whether "
            "the message is phishing or safe, and the reasoning should be sound."
        ),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
        ],
        model=model,
        threshold=0.7,
    )

    passed = 0
    failed = 0

    for i, item in enumerate(golden_set[:3]):
        if i > 0:
            time.sleep(5)  # Stay under Gemini free-tier 15 RPM
        result = classify_fn(item["text"])
        test_case = LLMTestCase(
            input=item["text"],
            actual_output=f"Classification: {result['label']}. Explanation: {result['explanation']}",
            expected_output=f"This message should be classified as: {item['label']}",
        )
        correctness_metric.measure(test_case)
        if correctness_metric.score >= correctness_metric.threshold:
            passed += 1
        else:
            failed += 1

    # At least 80% should pass
    total = passed + failed
    pass_rate = passed / total if total else 0
    assert pass_rate >= 0.8, (
        f"Classification correctness pass rate {pass_rate:.0%} < 80% "
        f"({passed}/{total} passed)"
    )
