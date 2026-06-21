"""
Memory context builder for Apex Smart
Builds context from memories for AI conversations
"""
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from src.services.memory.storage import get_memory_storage, MemoryStorage


class MemoryContextBuilder:
    """Builds context from user memories"""
    
    def __init__(self, db: Session):
        self.storage = MemoryStorage(db)
    
    def build_memory_context(
        self,
        query: Optional[str] = None,
        max_facts: int = 5,
        categories: Optional[List[str]] = None
    ) -> str:
        """
        Build a memory context string for AI
        
        Args:
            query: Current conversation topic for relevance
            max_facts: Maximum number of facts to include
            categories: Specific categories to include
            
        Returns:
            Formatted memory context string
        """
        if query:
            facts = self.storage.get_facts_for_context(query, max_facts, categories)
        else:
            # Get most confident facts if no query
            facts = self.storage.list_facts(
                category=categories[0] if categories and len(categories) == 1 else None,
                limit=max_facts,
                min_confidence=0.7
            )
        
        if not facts:
            return ""
        
        lines = ["## User Information", ""]
        
        # Group by category
        by_category: Dict[str, List[str]] = {}
        for fact in facts:
            cat = fact.category
            if cat not in by_category:
                by_category[cat] = []
            by_category[cat].append(f"- {fact.content}")
        
        # Format by category
        category_names = {
            "personal_info": "Personal Information",
            "preference": "Preferences",
            "fact": "Known Facts",
            "skill": "Skills & Abilities",
            "goal": "Goals & Objectives"
        }
        
        for cat, items in by_category.items():
            cat_name = category_names.get(cat, cat.replace("_", " ").title())
            lines.append(f"### {cat_name}")
            lines.extend(items)
            lines.append("")
        
        return "\n".join(lines)
    
    def get_system_prompt_addition(
        self,
        query: Optional[str] = None,
        max_facts: int = 5
    ) -> str:
        """
        Get memory context formatted as a system prompt addition
        
        Args:
            query: Current conversation topic
            max_facts: Maximum facts to include
            
        Returns:
            System prompt addition
        """
        context = self.build_memory_context(query, max_facts)
        
        if not context:
            return ""
        
        return f"""The following is information about the user that you should remember and reference:

{context}

Use this information to personalize your responses."""
    
    def should_inject_memory(self, message: str) -> bool:
        """
        Determine if memory context should be injected for this message
        
        Args:
            message: User message
            
        Returns:
            True if memory should be injected
        """
        # Always inject for short messages that might reference previous info
        if len(message) < 50:
            return True
        
        # Check for pronouns that might reference memory
        pronouns = ["my", "i", "me", "mine"]
        message_lower = message.lower()
        
        return any(p in message_lower.split() for p in pronouns)


class ConversationMemoryManager:
    """Manages memory for a conversation session"""
    
    def __init__(self, db: Session, conversation_id: Optional[str] = None):
        self.db = db
        self.conversation_id = conversation_id
        self.context_builder = MemoryContextBuilder(db)
        self.storage = MemoryStorage(db)
        self._injected_facts: List[str] = []
    
    def get_enhanced_system_prompt(
        self,
        base_prompt: str,
        user_message: Optional[str] = None
    ) -> str:
        """
        Enhance system prompt with relevant memories
        
        Args:
            base_prompt: Original system prompt
            user_message: Current user message for relevance
            
        Returns:
            Enhanced system prompt
        """
        memory_context = self.context_builder.get_system_prompt_addition(
            query=user_message,
            max_facts=5
        )
        
        if not memory_context:
            return base_prompt
        
        return f"{base_prompt}\n\n{memory_context}"
    
    def extract_and_store(
        self,
        message: str,
        role: str = "user"
    ) -> List[Dict[str, Any]]:
        """
        Extract facts from message and store them
        
        Args:
            message: Message content
            role: Message role
            
        Returns:
            List of stored facts
        """
        from src.services.memory.extractor import get_extractor
        
        extractor = get_extractor()
        
        # Check if we should extract
        if not extractor.should_extract(message, role):
            return []
        
        # Extract facts
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        facts = loop.run_until_complete(extractor.extract_facts(message))
        
        # Store facts
        stored = []
        for fact in facts:
            if fact.confidence >= 0.5:  # Only store high-confidence facts
                memory_fact = self.storage.add_fact(
                    content=fact.content,
                    category=fact.category,
                    confidence=fact.confidence,
                    conversation_id=self.conversation_id
                )
                stored.append(memory_fact.to_dict())
        
        return stored


def get_memory_context_builder(db: Session) -> MemoryContextBuilder:
    """Factory function for MemoryContextBuilder"""
    return MemoryContextBuilder(db)


def get_conversation_memory_manager(
    db: Session,
    conversation_id: Optional[str] = None
) -> ConversationMemoryManager:
    """Factory function for ConversationMemoryManager"""
    return ConversationMemoryManager(db, conversation_id)
