"""
Gemini Client for Analysis Service

Features:
- Multi-key rotation
- Model failover
- Request caching
"""

import hashlib
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

import google.generativeai as genai

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
    """Gemini API client with failover and caching."""
    
    FREE_MODELS = [
        "gemini-2.5-flash",
        "gemini-2.0-flash-exp",
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
    ]
    
    def __init__(self):
        self.api_keys = settings.gemini_keys_list
        self.current_key_index = 0
        self.cache: Dict[str, CacheEntry] = {}
        self.cache_ttl = 1800
        
        if not self.api_keys:
            logger.warning("No Gemini API keys found!")
        else:
            logger.info(f"Initialized GeminiClient with {len(self.api_keys)} API key(s)")
    
    def _get_next_key(self) -> Optional[str]:
        if not self.api_keys:
            return None
        key = self.api_keys[self.current_key_index]
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return key
    
    def _generate_cache_key(self, prompt: str, system_instruction: str, user_id: str = "") -> str:
        normalized = f"{user_id}:{system_instruction}:{prompt.lower().strip()}"
        return hashlib.sha256(normalized.encode()).hexdigest()
    
    def _clean_expired_cache(self):
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
        """Generate content using Gemini with failover and caching."""
        if use_cache:
            cache_key = self._generate_cache_key(prompt, system_instruction, user_id)
            self._clean_expired_cache()
            
            if cache_key in self.cache and not self.cache[cache_key].is_expired():
                logger.info("Cache hit for request")
                return self.cache[cache_key].value
        
        last_error = None
        for model_name in self.FREE_MODELS:
            try:
                response_text = await self._try_model(
                    model_name,
                    prompt,
                    system_instruction,
                    generation_config
                )
                
                if use_cache:
                    self.cache[cache_key] = CacheEntry(response_text, self.cache_ttl)
                
                return response_text
                
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                
                if "quota" in error_str or "rate limit" in error_str or "429" in error_str:
                    logger.warning(f"Model {model_name} quota reached, trying next...")
                    continue
                elif "404" in error_str or "not found" in error_str:
                    logger.warning(f"Model {model_name} not found, trying next...")
                    continue
                elif "401" in error_str or "403" in error_str:
                    logger.error(f"API key auth failed: {e}")
                    if len(self.api_keys) > 1:
                        continue
                    raise Exception("Gemini API key is invalid")
                else:
                    logger.error(f"Model {model_name} failed: {e}")
                    continue
        
        raise Exception(f"All Gemini models failed. Last error: {last_error}")
    
    async def _try_model(
        self,
        model_name: str,
        prompt: str,
        system_instruction: str,
        generation_config: Optional[Dict]
    ) -> str:
        api_key = self._get_next_key()
        if not api_key:
            raise Exception("No API keys available")
        
        genai.configure(api_key=api_key)
        
        model_kwargs = {"model_name": model_name}
        if system_instruction:
            model_kwargs["system_instruction"] = system_instruction
        
        model = genai.GenerativeModel(**model_kwargs)
        
        if generation_config:
            gen_config = genai.types.GenerationConfig(**generation_config)
        else:
            gen_config = genai.types.GenerationConfig(
                temperature=0.3,
                top_p=0.8,
                top_k=40,
            )
        
        logger.info(f"Attempting generation with model: {model_name}")
        response = model.generate_content(prompt, generation_config=gen_config)
        
        response_text = response.text.strip()
        logger.info(f"Generated {len(response_text)} chars with {model_name}")
        
        return response_text


_gemini_client: Optional[GeminiClient] = None


def get_gemini_client() -> GeminiClient:
    """Get or create global GeminiClient instance."""
    global _gemini_client
    if _gemini_client is None:
        _gemini_client = GeminiClient()
    return _gemini_client
