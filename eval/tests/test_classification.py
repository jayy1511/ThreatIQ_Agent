"""
ThreatIQ Evaluation – Classification Benchmark Tests

Runs the sample dataset and evaluates using:
  1. Deterministic accuracy threshold (no key needed)
  2. DeepEval GEval metrics (needs GEMINI_API_KEY)

Run deterministic only:   pytest eval/tests/test_classification.py -k "not geval"
Run all (with Gemini):    deepeval test run eval/tests/
"""

from __future__ import annotations

import json
import os
import time
import pytest
from pathlib import Path

EVAL_DIR = Path(__file__).resolve().parent.parent  # eval/


# ──────────────────────────────────────────────
# Deterministic: accuracy threshold on sample set
# ──────────────────────────────────────────────

def test_stub_accuracy_threshold(sample_set, classify_fn):
    """Overall accuracy must exceed baseline threshold.
    
    Note: stub mode uses a keyword heuristic (~50% on diverse data).
    Live mode against the AI service should exceed 85%.
    """
    correct = 0
    total = len(sample_set)

    for item in sample_set:
        result = classify_fn(item["text"])
        if result["label"].lower() == item["label"].lower():
            correct += 1

    accuracy = correct / total if total else 0
    threshold = 0.80 if os.getenv("EVAL_MODE") == "live" else 0.45
    assert accuracy >= threshold, (
        f"Accuracy {accuracy:.2%} ({correct}/{total}) is below {threshold:.0%} threshold"
    )


def test_no_errors(sample_set, classify_fn):
    """No classification should return 'error' as label."""
    errors = []
    for item in sample_set:
        result = classify_fn(item["text"])
        if result["label"] == "error":
            errors.append(item["id"])
    assert len(errors) == 0, f"Got {len(errors)} errors: {errors[:5]}"


def test_confidence_range(sample_set, classify_fn):
    """All confidence scores should be between 0 and 1."""
    for item in sample_set:
        result = classify_fn(item["text"])
        assert 0 <= result["confidence"] <= 1, (
            f"{item['id']}: confidence {result['confidence']} out of [0,1] range"
        )


# ──────────────────────────────────────────────
# Phishing detection: precision and recall
# ──────────────────────────────────────────────

def test_phishing_recall(sample_set, classify_fn):
    """Actual phishing messages should be caught above threshold.
    Skipped in stub mode — keyword heuristic is too simple for diverse data.
    """
    if os.getenv("EVAL_MODE", "stub") != "live":
        pytest.skip("Precision/recall only meaningful in live mode")
    tp = fn = 0
    for item in sample_set:
        if item["label"].lower() != "phishing":
            continue
        result = classify_fn(item["text"])
        if result["label"].lower() == "phishing":
            tp += 1
        else:
            fn += 1
    recall = tp / (tp + fn) if (tp + fn) else 0
    threshold = 0.80 if os.getenv("EVAL_MODE") == "live" else 0.40
    assert recall >= threshold, f"Phishing recall {recall:.2%} < {threshold:.0%}"


def test_safe_precision(sample_set, classify_fn):
    """Messages predicted as safe should actually be safe above threshold.
    Skipped in stub mode — keyword heuristic is too simple for diverse data.
    """
    if os.getenv("EVAL_MODE", "stub") != "live":
        pytest.skip("Precision/recall only meaningful in live mode")
    tp = fp = 0
    for item in sample_set:
        result = classify_fn(item["text"])
        if result["label"].lower() == "safe":
            if item["label"].lower() == "safe":
                tp += 1
            else:
                fp += 1
    precision = tp / (tp + fp) if (tp + fp) else 0
    threshold = 0.80 if os.getenv("EVAL_MODE") == "live" else 0.45
    assert precision >= threshold, f"Safe precision {precision:.2%} < {threshold:.0%}"


# ──────────────────────────────────────────────
# DeepEval GEval: batch classification quality
# ──────────────────────────────────────────────

@pytest.mark.geval
def test_geval_batch_classification(sample_set, classify_fn):
    """LLM-judge: evaluate classification quality on a sample batch."""
    if not os.getenv("GEMINI_API_KEY"):
        pytest.skip("GEMINI_API_KEY not set -- skipping LLM-judge test")

    from deepeval.test_case import LLMTestCase, LLMTestCaseParams
    from deepeval.metrics import GEval
    from lib.gemini_model import GeminiModel

    model = GeminiModel()

    quality_metric = GEval(
        name="Classification Quality",
        criteria=(
            "Evaluate whether the phishing/safe classification and explanation "
            "are accurate and helpful. The classification should correctly identify "
            "phishing attempts and safe messages, and the explanation should cite "
            "specific evidence from the message text."
        ),
        evaluation_params=[
            LLMTestCaseParams.INPUT,
            LLMTestCaseParams.ACTUAL_OUTPUT,
            LLMTestCaseParams.EXPECTED_OUTPUT,
        ],
        model=model,
        threshold=0.5,
    )

    # Evaluate a small batch (free tier friendly — only 3 API calls)
    batch = sample_set[:3]
    scores = []

    for i, item in enumerate(batch):
        if i > 0:
            time.sleep(5)  # Stay under Gemini free-tier 15 RPM
        result = classify_fn(item["text"])
        test_case = LLMTestCase(
            input=item["text"],
            actual_output=(
                f"Classification: {result['label']} "
                f"(confidence: {result['confidence']}). "
                f"Explanation: {result['explanation']}"
            ),
            expected_output=f"This message is {item['label']}.",
        )
        quality_metric.measure(test_case)
        scores.append(quality_metric.score)

    avg_score = sum(scores) / len(scores) if scores else 0
    assert avg_score >= 0.5, (
        f"Average classification quality {avg_score:.2f} < 0.5 threshold"
    )
