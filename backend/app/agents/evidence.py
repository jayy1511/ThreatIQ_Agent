from app.tools.dataset_tools import phishing_dataset
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class EvidenceAgent:
    """
    Evidence Agent - Finds similar phishing examples from the dataset.
    """
    
    def __init__(self):
        phishing_dataset.load_dataset()
    
    async def find_evidence(
        self,
        message: str,
        reason_tags: List[str],
        category: str,
        max_examples: int = 3
    ) -> List[Dict]:
        """
        Find similar phishing examples from the dataset.
        
        Args:
            message: The original message
            reason_tags: Classification reason tags
            category: Determined phishing category
            max_examples: Maximum number of examples to return
            
        Returns:
            List of similar examples with message, category, and description
        """
        try:
            examples = phishing_dataset.find_similar_examples(
                message=message,
                reason_tags=reason_tags,
                max_examples=max_examples
            )
            
            if len(examples) < max_examples and category != 'general_phishing':
                category_examples = phishing_dataset.get_category_examples(
                    category=category,
                    max_examples=max_examples - len(examples)
                )
                examples.extend(category_examples)
            
            logger.info(f"Found {len(examples)} evidence examples")
            return examples[:max_examples]
            
        except Exception as e:
            logger.error(f"Error finding evidence: {e}")
            return []


evidence_agent = EvidenceAgent()
