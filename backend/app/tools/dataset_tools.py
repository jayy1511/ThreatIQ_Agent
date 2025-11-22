"""
Dataset Tools - Wrapper for ADK tools

This module provides backward compatibility by wrapping ADK tools.
"""

from app.tools.adk_tools import load_phishing_dataset, find_similar_phishing
import logging

logger = logging.getLogger(__name__)


class PhishingDataset:
    """Manager for phishing dataset operations (wrapper for ADK tools)."""
    
    def __init__(self, dataset_path: str = "data/phishing_dataset.csv"):
        self.dataset_path = dataset_path
        self._loaded = False
    
    def load_dataset(self) -> bool:
        """Load dataset using ADK tool."""
        try:
            result = load_phishing_dataset()
            if 'error' not in result:
                self._loaded = True
                logger.info(f"Loaded dataset: {result}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            return False
    
    def find_similar_examples(
        self,
        message: str,
        reason_tags: list = None,
        max_examples: int = 3
    ) -> list:
        """Find similar examples using ADK tool."""
        return find_similar_phishing(
            message=message,
            category=None,
            max_results=max_examples
        )
    
    def get_category_examples(self, category: str, max_examples: int = 3) -> list:
        """Get category examples using ADK tool."""
        return find_similar_phishing(
            message="",
            category=category,
            max_results=max_examples
        )


# Global instance
phishing_dataset = PhishingDataset()
