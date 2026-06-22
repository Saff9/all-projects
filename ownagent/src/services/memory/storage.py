"""
Memory storage for Apex Smart
Handles storing and retrieving memory facts
"""
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from src.models.database import MemoryFact


class MemoryStorage:
    """Storage for memory facts"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def add_fact(
        self,
        content: str,
        category: str = "fact",
        confidence: float = 1.0,
        conversation_id: Optional[str] = None
    ) -> MemoryFact:
        """
        Add a new memory fact
        
        Args:
            content: The fact content
            category: Category (preference, fact, skill, goal, personal_info)
            confidence: Confidence level (0-1)
            conversation_id: Source conversation ID
            
        Returns:
            Created MemoryFact
        """
        import uuid
        
        fact = MemoryFact(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            category=category,
            content=content,
            confidence=confidence,
            is_active=True
        )
        
        self.db.add(fact)
        self.db.commit()
        self.db.refresh(fact)
        
        return fact
    
    def get_fact(self, fact_id: str) -> Optional[MemoryFact]:
        """Get a specific fact by ID"""
        return self.db.query(MemoryFact).filter(
            MemoryFact.id == fact_id,
            MemoryFact.is_active == True
        ).first()
    
    def list_facts(
        self,
        category: Optional[str] = None,
        limit: int = 50,
        min_confidence: float = 0.0
    ) -> List[MemoryFact]:
        """
        List memory facts
        
        Args:
            category: Filter by category
            limit: Maximum number of results
            min_confidence: Minimum confidence level
            
        Returns:
            List of MemoryFact objects
        """
        query = self.db.query(MemoryFact).filter(
            MemoryFact.is_active == True,
            MemoryFact.confidence >= min_confidence
        )
        
        if category:
            query = query.filter(MemoryFact.category == category)
        
        return query.order_by(MemoryFact.confidence.desc()).limit(limit).all()
    
    def update_fact(
        self,
        fact_id: str,
        content: Optional[str] = None,
        confidence: Optional[float] = None,
        is_active: Optional[bool] = None
    ) -> Optional[MemoryFact]:
        """
        Update a memory fact
        
        Args:
            fact_id: Fact ID
            content: New content (optional)
            confidence: New confidence (optional)
            is_active: New active status (optional)
            
        Returns:
            Updated MemoryFact or None if not found
        """
        fact = self.get_fact(fact_id)
        if not fact:
            return None
        
        if content is not None:
            fact.content = content
        if confidence is not None:
            fact.confidence = confidence
        if is_active is not None:
            fact.is_active = is_active
        
        self.db.commit()
        self.db.refresh(fact)
        
        return fact
    
    def delete_fact(self, fact_id: str) -> bool:
        """
        Soft delete a memory fact
        
        Args:
            fact_id: Fact ID
            
        Returns:
            True if deleted, False if not found
        """
        fact = self.db.query(MemoryFact).filter(MemoryFact.id == fact_id).first()
        if not fact:
            return False
        
        fact.is_active = False
        self.db.commit()
        
        return True
    
    def search_facts(
        self,
        query: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Search facts by content (simple text search)
        
        Args:
            query: Search query
            limit: Maximum results
            
        Returns:
            List of matching facts with similarity scores
        """
        # Sanitize search query to prevent SQL injection
        # Escape special characters for ilike pattern
        sanitized_query = query.replace("%", "\\%").replace("_", "\\_")
        
        # Use SQLAlchemy's ilike which is parameterized
        facts = self.db.query(MemoryFact).filter(
            MemoryFact.is_active == True,
            MemoryFact.content.ilike(f"%{sanitized_query}%")
        ).limit(limit).all()
        
        results = []
        for fact in facts:
            # Simple similarity based on substring match
            similarity = len(query) / len(fact.content) if fact.content else 0
            results.append({
                "fact": fact,
                "similarity": min(similarity * 2, 1.0)  # Scale up but cap at 1.0
            })
        
        # Sort by similarity
        results.sort(key=lambda x: x["similarity"], reverse=True)
        
        return results
    
    def get_facts_for_context(
        self,
        query: str,
        max_facts: int = 5,
        categories: Optional[List[str]] = None
    ) -> List[MemoryFact]:
        """
        Get relevant facts for injection into chat context
        
        Args:
            query: Current conversation context/query
            max_facts: Maximum number of facts to return
            categories: Filter by categories
            
        Returns:
            List of relevant MemoryFact objects
        """
        base_query = self.db.query(MemoryFact).filter(
            MemoryFact.is_active == True,
            MemoryFact.confidence >= 0.5
        )
        
        if categories:
            base_query = base_query.filter(MemoryFact.category.in_(categories))
        
        # Get facts that might be relevant based on keyword matching
        # This is a simple implementation - in production, use embeddings
        keywords = query.lower().split()
        all_facts = base_query.all()
        
        scored_facts = []
        for fact in all_facts:
            score = 0
            fact_content = fact.content.lower()
            for keyword in keywords:
                if len(keyword) > 3 and keyword in fact_content:
                    score += 1
            if score > 0:
                scored_facts.append((fact, score * fact.confidence))
        
        # Sort by score and return top results
        scored_facts.sort(key=lambda x: x[1], reverse=True)
        return [fact for fact, score in scored_facts[:max_facts]]
    
    def merge_similar_facts(self, similarity_threshold: float = 0.8) -> int:
        """
        Merge duplicate or very similar facts
        
        Args:
            similarity_threshold: Threshold for considering facts similar
            
        Returns:
            Number of facts merged
        """
        # Simple implementation - in production, use embeddings for similarity
        facts = self.list_facts()
        merged_count = 0
        
        for i, fact1 in enumerate(facts):
            for fact2 in facts[i+1:]:
                # Check if facts are similar
                if fact1.category == fact2.category:
                    # Simple string similarity
                    from difflib import SequenceMatcher
                    similarity = SequenceMatcher(None, fact1.content.lower(), fact2.content.lower()).ratio()
                    
                    if similarity >= similarity_threshold:
                        # Keep the one with higher confidence
                        if fact1.confidence >= fact2.confidence:
                            fact2.is_active = False
                        else:
                            fact1.is_active = False
                        merged_count += 1
        
        if merged_count > 0:
            self.db.commit()
        
        return merged_count
    
    def get_stats(self) -> Dict[str, Any]:
        """Get memory statistics"""
        total = self.db.query(MemoryFact).filter(MemoryFact.is_active == True).count()
        
        by_category = {}
        for category in ["preference", "fact", "skill", "goal", "personal_info"]:
            count = self.db.query(MemoryFact).filter(
                MemoryFact.category == category,
                MemoryFact.is_active == True
            ).count()
            by_category[category] = count
        
        return {
            "total_facts": total,
            "by_category": by_category
        }


def get_memory_storage(db: Session) -> MemoryStorage:
    """Factory function to create MemoryStorage instance"""
    return MemoryStorage(db)
