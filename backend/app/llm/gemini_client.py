"""
Centralized Gemini Client for ThreatIQ

Features:
- Multi-key rotation (GEMINI_API_KEYS or fallback to GEMINI_API_KEY)
- Model failover (automatic switch when quota reached)
- Request caching (reduce quota usage)
- Smart error handling (map errors to HTTP responses)
"""

import hashlib
import json
import logging
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

import google.generativeai as genai
from google.api_core import exceptions as google_exceptions

from app.config import settings

logger = logging.getLogger(__name__)


class CacheEntry:
    """Simple cache entry with TTL."""
    def __init__(self, value: Any, ttl_seconds: int = 1800):
        self.value = value
        self.expires_at = datetime.utcnow() + timedelta(seconds=ttl_seconds)
    
    def is_expired(self) -> bool:
        return datetime.utcnow() > self.expires_at


class GeminiClient:
    """
    Centralized Gemini API client with failover and caching.
    """
    
    # Free tier models in order of preference (best to fallback)
    FREE_MODELS = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
    ]
    
    def __init__(self):
        self.api_keys = self._load_api_keys()
        self.current_key_index = 0
        self.cache: Dict[str, CacheEntry] = {}
        self.cache_ttl = 1800  # 30 minutes
        
        if not self.api_keys:
            logger.warning("No Gemini API keys found in configuration!")
        else:
            logger.info(f"Initialized GeminiClient with {len(self.api_keys)} API key(s)")
    
    def _load_api_keys(self) -> List[str]:
        """Load API keys from settings."""
        keys = settings.gemini_keys_list
        if not keys:
            logger.error("No Gemini API keys configured!")
        return keys
    
    def _get_next_key(self) -> Optional[str]:
        """Get next API key in round-robin fashion."""
        if not self.api_keys:
            return None
        
        key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return key
    
    def _generate_cache_key(self, prompt: str, system_instruction: str, user_id: str = "") -> str:
        """Generate cache key from request parameters."""
        # Normalize prompt (lowercase, strip whitespace)
        normalized = f"{user_id}:{system_instruction}:{prompt.lower().strip()}"
        return hashlib.sha256(normalized.encode()).hexdigest()
    
    def _clean_expired_cache(self):
        """Remove expired cache entries."""
        expired_keys = [k for k, v in self.cache.items() if v.is_expired()]
        for key in expired_keys:
            del self.cache[key]
    
    async def generate(
        self,
        prompt: str,
        system_instruction: str = "",
        generation_config: Optional[Dict] = None,
        use_cache: bool = True,
        user_id: str = ""
    ) -> str:
        """
        Generate content using Gemini with failover and caching.
        
        Args:
            prompt: User prompt
            system_instruction: System instruction for the model
            generation_config: Generation configuration dict
            use_cache: Whether to use caching
            user_id: User ID for cache key personalization
            
        Returns:
            Generated text response
            
        Raises:
            Exception: If all models and keys fail
        """
        # Check cache first
        if use_cache:
            cache_key = self._generate_cache_key(prompt, system_instruction, user_id)
            self._clean_expired_cache()
            
            if cache_key in self.cache and not self.cache[cache_key].is_expired():
                logger.info("Cache hit for request")
                return self.cache[cache_key].value
        
        # Try each model with failover
        last_error = None
        for model_name in self.FREE_MODELS:
            try:
                response_text = await self._try_model(
                    model_name,
                    prompt,
                    system_instruction,
                    generation_config
                )
                
                # Cache successful response
                if use_cache:
                    self.cache[cache_key] = CacheEntry(response_text, self.cache_ttl)
                
                return response_text
                
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                
                # Check if it's a quota/rate limit error
                if "quota" in error_str or "rate limit" in error_str or "429" in error_str:
                    logger.warning(f"Model {model_name} quota reached, trying next model...")
                    continue
                
                # Check if model not found
                elif "404" in error_str or "not found" in error_str:
                    logger.warning(f"Model {model_name} not found, trying next model...")
                    continue
                
                # For auth errors, try different key
                elif "401" in error_str or "403" in error_str or "api key" in error_str:
                    logger.error(f"API key authentication failed: {e}")
                    # Try next key if available
                    if len(self.api_keys) > 1:
                        logger.info("Trying next API key...")
                        continue
                    else:
                        raise Exception("Gemini API key is invalid or expired")
                
                # For other errors, log and continue to next model
                else:
                    logger.error(f"Model {model_name} failed: {e}")
                    continue
        
        # All models failed
        error_msg = f"All Gemini models failed. Last error: {last_error}"
        logger.error(error_msg)
        raise Exception(error_msg)
    
    async def _try_model(
        self,
        model_name: str,
        prompt: str,
        system_instruction: str,
        generation_config: Optional[Dict]
    ) -> str:
        """
        Try to generate content with a specific model.
        
        Args:
            model_name: Name of the Gemini model
            prompt: User prompt
            system_instruction: System instruction
            generation_config: Generation configuration
            
        Returns:
            Generated text
            
        Raises:
            Exception: If generation fails
        """
        api_key = self._get_next_key()
        if not api_key:
            raise Exception("No API keys available")
        
        # Configure with current key
        genai.configure(api_key=api_key)
        
        # Create model
        model_kwargs = {"model_name": model_name}
        if system_instruction:
            model_kwargs["system_instruction"] = system_instruction
        
        model = genai.GenerativeModel(**model_kwargs)
        
        # Prepare generation config
        if generation_config:
            gen_config = genai.types.GenerationConfig(**generation_config)
        else:
            gen_config = genai.types.GenerationConfig(
                temperature=0.3,
                top_p=0.8,
                top_k=40,
            )
        
        # Generate content
        logger.info(f"Attempting generation with model: {model_name}")
        response = model.generate_content(
            prompt,
            generation_config=gen_config
        )
        
        response_text = response.text.strip()
        logger.info(f"Successfully generated {len(response_text)} chars with {model_name}")
        
        return response_text


# Global singleton instance
_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create global GeminiClient instance."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client
