"""
ThreatIQ Evaluation – Gemini Model Wrapper for DeepEval

Wraps Google Gemini via the google-genai SDK as a DeepEval judge model.
Reads GEMINI_API_KEY from environment.

Uses gemini-2.0-flash-lite by default (separate quota from gemini-2.0-flash
used by the analysis service, and higher free-tier limits).
Includes automatic retry with backoff for 429 rate-limit errors.
Gracefully skips when daily quota is exhausted.
"""

from __future__ import annotations

import os
import time
import asyncio
from deepeval.models.base_model import DeepEvalBaseLLM

MAX_RETRIES = 3
RETRY_DELAY = 30  # seconds — kept short to stay within DeepEval's timeout


class GeminiModel(DeepEvalBaseLLM):
    """Custom DeepEval LLM using Google Gemini via google-genai."""

    def __init__(self, model_name: str = "gemini-2.0-flash-lite"):
        self._model_name = model_name
        self._client = None

    def get_model_name(self) -> str:
        return self._model_name

    def load_model(self):
        if self._client is None:
            from google import genai
            api_key = os.getenv("GEMINI_API_KEY", "")
            if not api_key:
                raise EnvironmentError(
                    "GEMINI_API_KEY environment variable is required for LLM-judge metrics. "
                    "Set it or run with: pytest -k 'not geval'"
                )
            self._client = genai.Client(api_key=api_key)
        return self._client

    @staticmethod
    def _is_daily_quota(error_msg: str) -> bool:
        """Check if the 429 is a daily quota limit (no point retrying)."""
        return "PerDay" in error_msg or "PerDayPerProject" in error_msg

    def generate(self, prompt: str) -> str:
        from google.genai import errors
        client = self.load_model()
        for attempt in range(MAX_RETRIES):
            try:
                response = client.models.generate_content(
                    model=self._model_name,
                    contents=prompt,
                )
                return response.text
            except errors.ClientError as e:
                err_msg = str(e)
                if "429" not in err_msg or attempt >= MAX_RETRIES - 1:
                    raise
                if self._is_daily_quota(err_msg):
                    raise RuntimeError(
                        "Daily Gemini free-tier quota exhausted. "
                        "Try again tomorrow or run: pytest -k 'not geval'"
                    ) from e
                print(f"  ⏳ Rate limited, waiting {RETRY_DELAY}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                time.sleep(RETRY_DELAY)

    async def a_generate(self, prompt: str) -> str:
        from google.genai import errors
        client = self.load_model()
        for attempt in range(MAX_RETRIES):
            try:
                response = await client.aio.models.generate_content(
                    model=self._model_name,
                    contents=prompt,
                )
                return response.text
            except errors.ClientError as e:
                err_msg = str(e)
                if "429" not in err_msg or attempt >= MAX_RETRIES - 1:
                    raise
                if self._is_daily_quota(err_msg):
                    raise RuntimeError(
                        "Daily Gemini free-tier quota exhausted. "
                        "Try again tomorrow or run: pytest -k 'not geval'"
                    ) from e
                print(f"  ⏳ Rate limited, waiting {RETRY_DELAY}s (attempt {attempt + 1}/{MAX_RETRIES})...")
                await asyncio.sleep(RETRY_DELAY)
