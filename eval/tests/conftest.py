"""
Shared fixtures for ThreatIQ DeepEval tests.
"""

from __future__ import annotations

import json
import os
import re
import pytest
from pathlib import Path
from typing import Any, Dict, List

EVAL_DIR = Path(__file__).resolve().parent.parent  # eval/
DATA_DIR = EVAL_DIR / "data"

# ──────────────────────────────────────────────
# Data loading
# ──────────────────────────────────────────────

@pytest.fixture(scope="session")
def golden_set() -> List[Dict]:
    with open(DATA_DIR / "golden_set.json", "r", encoding="utf-8") as f:
        return json.load(f)


@pytest.fixture(scope="session")
def sample_set() -> List[Dict]:
    with open(DATA_DIR / "sample_set.json", "r", encoding="utf-8") as f:
        return json.load(f)


# ──────────────────────────────────────────────
# Stub heuristic classifier (no API key needed)
# ──────────────────────────────────────────────

PHISHING_KEYWORDS = [
    "urgent", "immediately", "verify your", "click here", "act now",
    "account suspended", "confirm your identity", "password expires",
    "won a prize", "claim your", "limited time", "congratulations",
    "unauthorized access", "security alert", "update your payment",
    "bank account", "social security", "gift card", "wire transfer",
    "unusual activity", "locked", "expire", "compromised",
    "payment was declined", "avoid service interruption",
    "no experience needed", "limited spots", "earn money",
    "get started", "selected for", "apply now",
    "virus", "call microsoft", "call support", "lose all your data",
    "windows license", "tech support",
    "send your full name", "transfer this money", "commission",
    "prince", "late father", "bank details",
]

SUSPICIOUS_URL_RE = re.compile(
    r"https?://[a-z0-9]+(?:-[a-z0-9]+){2,}\."
    r"|https?://[a-z0-9\-]+\.(xyz|tk|ml|ga|cf|top|buzz|click)",
    re.IGNORECASE,
)

LINK_RE = re.compile(r"https?://\S+", re.IGNORECASE)


def stub_classify(text: str) -> Dict[str, Any]:
    """Keyword + URL heuristic baseline (no LLM needed)."""
    text_lower = text.lower()
    matched_kw = [kw for kw in PHISHING_KEYWORDS if kw in text_lower]
    has_sus_url = bool(SUSPICIOUS_URL_RE.search(text))
    has_link = bool(LINK_RE.search(text))

    score = len(matched_kw) * 2
    if has_sus_url:
        score += 5
    elif has_link:
        score += 2

    if score >= 3:
        label = "phishing"
        confidence = min(0.5 + score * 0.05, 0.99)
    else:
        label = "safe"
        confidence = min(0.5 + (8 - score) * 0.06, 0.99)

    reason_tags = []
    if matched_kw:
        reason_tags.append("urgent_language")
    if has_sus_url or has_link:
        reason_tags.append("suspicious_link")
    if any(w in text_lower for w in ["verify", "confirm", "update your"]):
        reason_tags.append("request_personal_info")
    if any(w in text_lower for w in ["prize", "won", "congratulations", "winner"]):
        reason_tags.append("too_good_to_be_true")
    if any(w in text_lower for w in ["ceo", "boss", "gift card"]):
        reason_tags.append("impersonation")

    return {
        "label": label,
        "confidence": round(confidence, 3),
        "reason_tags": reason_tags,
        "explanation": f"Stub heuristic: {len(matched_kw)} keyword hits, "
                       f"link={'suspicious' if has_sus_url else ('yes' if has_link else 'no')}",
    }


# ──────────────────────────────────────────────
# Live classifier (calls real service)
# ──────────────────────────────────────────────

def live_classify(text: str) -> Dict[str, Any]:
    """Call the live analysis-service endpoint."""
    import urllib.request
    import urllib.error

    base_url = os.getenv("EVAL_SERVICE_URL", "http://localhost:8010/analyze")
    payload = json.dumps({"message": text, "user_guess": "unclear"}).encode()
    req = urllib.request.Request(
        base_url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            data = json.loads(resp.read().decode())
        cls = data.get("classification", {})
        return {
            "label": cls.get("label", "unknown"),
            "confidence": cls.get("confidence", 0.0),
            "reason_tags": cls.get("reason_tags", []),
            "explanation": cls.get("explanation", ""),
        }
    except Exception as e:
        return {"label": "error", "confidence": 0.0, "reason_tags": [], "explanation": str(e)}


# ──────────────────────────────────────────────
# Classify dispatcher
# ──────────────────────────────────────────────

def classify(text: str) -> Dict[str, Any]:
    """Route to live or stub based on EVAL_MODE env var."""
    mode = os.getenv("EVAL_MODE", "stub")
    if mode == "live":
        return live_classify(text)
    return stub_classify(text)


@pytest.fixture(scope="session")
def classify_fn():
    """Return the classify function for tests."""
    return classify
