from typing import List, Dict
from difflib import SequenceMatcher
import re

def clean_text(text: str) -> str:
    """Remove extra spaces, markdown, or symbols for fair comparison."""
    if not text:
        return ""
    text = re.sub(r'\s+', ' ', text.strip())
    text = re.sub(r'[*_`#>-]', '', text)
    return text.lower()

def text_score(text: str) -> float:
    """Heuristic scoring: based on length and structure."""
    if not text:
        return 0
    length_score = min(len(text) / 500, 1)  # normalize to 0–1
    sentence_score = text.count('.') / max(len(text.split()), 1)
    return 0.6 * length_score + 0.4 * sentence_score

def pick_best(responses: List[str]) -> str:
    """Return the most complete and coherent answer."""
    cleaned = [clean_text(r) for r in responses if r]
    if not cleaned:
        return "Sorry, I couldn't generate a proper answer."
    
    # Score each response
    scores = [text_score(r) for r in cleaned]
    
    # Find the best one
    best_idx = scores.index(max(scores))
    best_response = responses[best_idx]
    return best_response
