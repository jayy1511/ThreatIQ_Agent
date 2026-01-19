"""
Dataset Tools - Phishing dataset similarity search
"""

import os
import logging
from typing import List, Dict, Optional

import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

logger = logging.getLogger(__name__)

# Global state
_dataset_df: Optional[pd.DataFrame] = None
_vectorizer: Optional[TfidfVectorizer] = None
_tfidf_matrix = None


def load_phishing_dataset() -> Dict:
    """Load the phishing dataset from CSV file."""
    global _dataset_df, _vectorizer, _tfidf_matrix
    
    # Reset cache when loading
    _vectorizer = None
    _tfidf_matrix = None
    
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    service_root = os.path.dirname(os.path.dirname(script_dir))  # services/analysis-service
    
    # Try multiple paths
    possible_paths = [
        os.path.join(service_root, "data", "phishing_dataset.csv"),
        "data/phishing_dataset.csv",
        "../data/phishing_dataset.csv",
        "/app/data/phishing_dataset.csv",
    ]
    
    dataset_path = None
    for path in possible_paths:
        logger.info(f"Checking path: {path}")
        if os.path.exists(path):
            dataset_path = path
            logger.info(f"Found dataset at: {path}")
            break
    
    if dataset_path is None:
        logger.warning("Dataset not found, creating dummy dataset")
        _create_dummy_dataset()
        return {"status": "created_dummy", "count": len(_dataset_df)}
    
    try:
        _dataset_df = pd.read_csv(dataset_path)
        logger.info(f"Loaded dataset with {len(_dataset_df)} entries")
        return {"status": "loaded", "count": len(_dataset_df)}
    except Exception as e:
        logger.error(f"Error loading dataset: {e}")
        _create_dummy_dataset()
        return {"status": "error_fallback", "count": len(_dataset_df)}


def _create_dummy_dataset():
    """Create a minimal dummy dataset."""
    global _dataset_df
    _dataset_df = pd.DataFrame({
        'text': [
            "Your account has been suspended. Click here to verify.",
            "Congratulations! You've won $1,000,000!",
            "Meeting reminder for tomorrow at 3pm.",
        ],
        'label': ['phishing', 'phishing', 'safe'],
        'category': ['account_alert', 'prize_scam', 'legitimate']
    })


def find_similar_phishing(
    message: str,
    category: Optional[str] = None,
    max_results: int = 3
) -> List[Dict]:
    """Find similar phishing examples using TF-IDF similarity."""
    global _dataset_df, _vectorizer, _tfidf_matrix
    
    if _dataset_df is None:
        load_phishing_dataset()
    
    if _dataset_df is None or len(_dataset_df) == 0:
        return []
    
    try:
        # Filter to phishing examples - handle both numeric (0/1) and string labels
        _dataset_df['label'] = _dataset_df['label'].astype(str)
        # Match "1", "phishing", "Phishing", etc.
        phishing_df = _dataset_df[
            (_dataset_df['label'] == '1') | 
            (_dataset_df['label'].str.lower() == 'phishing')
        ].copy()
        
        if len(phishing_df) == 0:
            return []
        
        # Reset index for alignment
        phishing_df = phishing_df.reset_index(drop=True)
        
        # Build vectorizer if needed
        if _vectorizer is None or _tfidf_matrix is None:
            _vectorizer = TfidfVectorizer(
                max_features=5000,
                stop_words='english',
                ngram_range=(1, 2)
            )
            _tfidf_matrix = _vectorizer.fit_transform(phishing_df['text'].fillna(''))
        
        # Transform query
        query_vec = _vectorizer.transform([message])
        similarities = cosine_similarity(query_vec, _tfidf_matrix).flatten()
        
        # Get top indices
        top_indices = similarities.argsort()[-max_results:][::-1]
        
        results = []
        for idx in top_indices:
            if idx < len(phishing_df):
                sim_score = float(similarities[idx])
                if np.isnan(sim_score) or sim_score < 0:
                    sim_score = 0.0
                
                row = phishing_df.iloc[idx]
                results.append({
                    "message": str(row.get('text', ''))[:500],
                    "category": str(row.get('category', 'unknown')),
                    "similarity": round(sim_score, 3)
                })
        
        return results
        
    except Exception as e:
        logger.error(f"Error in similarity search: {e}")
        return []


class PhishingDataset:
    """Manager for phishing dataset operations."""
    
    def __init__(self):
        self._loaded = False
    
    def load_dataset(self) -> bool:
        try:
            result = load_phishing_dataset()
            if 'error' not in result:
                self._loaded = True
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
        return find_similar_phishing(
            message=message,
            category=None,
            max_results=max_examples
        )
    
    def get_category_examples(self, category: str, max_examples: int = 3) -> list:
        return find_similar_phishing(
            message="",
            category=category,
            max_results=max_examples
        )


phishing_dataset = PhishingDataset()
