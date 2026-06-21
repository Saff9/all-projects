"""
Memory extractor for Apex Smart
Extracts facts and preferences from conversations using AI
"""
import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

from src.services.ai import get_provider_class


@dataclass
class ExtractedFact:
    """Extracted fact from conversation"""
    category: str  # preference, fact, skill, goal, personal_info
    content: str
    confidence: float
    source_message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "category": self.category,
            "content": self.content,
            "confidence": self.confidence,
            "source_message": self.source_message
        }


class MemoryExtractor:
    """Extracts memories from user messages"""
    
    # Patterns for simple extraction (fallback when AI is not available)
    PREFERENCE_PATTERNS = [
        r"i (?:prefer|like|love|enjoy) (.+)",
        r"my favorite (.+) is (.+)",
        r"i (?:don't|do not) (?:like|prefer|enjoy) (.+)",
        r"i hate (.+)",
        r"i'm (?:not )?a fan of (.+)"
    ]
    
    PERSONAL_INFO_PATTERNS = [
        r"my name is (.+)",
        r"i (?:work|am employed) (?:at|for) (.+)",
        r"i'm a (.+) (?:at|working) (.+)",
        r"i live in (.+)",
        r"i'm from (.+)",
        r"my (?:job|profession|career) is (.+)"
    ]
    
    DATE_PATTERNS = [
        r"my birthday is (.+)",
        r"i was born on (.+)",
        r"my anniversary is (.+)"
    ]
    
    GOAL_PATTERNS = [
        r"i want to (.+)",
        r"my goal is to (.+)",
        r"i'm trying to (.+)",
        r"i plan to (.+)",
        r"i'm working on (.+)"
    ]
    
    SKILL_PATTERNS = [
        r"i know how to (.+)",
        r"i can (.+)",
        r"i'm good at (.+)",
        r"i'm skilled in (.+)",
        r"i have experience with (.+)"
    ]
    
    def __init__(self, provider_id: str = "openai"):
        self.provider_id = provider_id
        self._provider = None
    
    def _get_provider(self):
        """Lazy load AI provider"""
        if self._provider is None:
            provider_class = get_provider_class(self.provider_id)
            if provider_class:
                # Try to get API key from environment
                import os
                api_key = os.getenv(f"{self.provider_id.upper()}_API_KEY")
                self._provider = provider_class(api_key=api_key)
        return self._provider
    
    async def extract_facts_ai(self, message: str, conversation_context: Optional[List[str]] = None) -> List[ExtractedFact]:
        """
        Extract facts using AI
        
        Args:
            message: User message to analyze
            conversation_context: Previous messages for context
            
        Returns:
            List of extracted facts
        """
        try:
            provider = self._get_provider()
            if not provider:
                return []
            
            # Build prompt for fact extraction
            context = "\n".join(conversation_context[-5:]) if conversation_context else ""
            
            prompt = f"""Analyze the following user message and extract any facts, preferences, personal information, goals, or skills mentioned.

Previous context:
{context}

Current message:
{message}

Extract facts in this JSON format:
[
  {{
    "category": "preference|fact|skill|goal|personal_info",
    "content": "the fact in clear, third-person form",
    "confidence": 0.0-1.0
  }}
]

Only include high-confidence facts. Return empty array if no clear facts are present."""

            # Get AI response
            from src.services.ai import Message, MessageRole, ChatCompletionRequest
            
            request = ChatCompletionRequest(
                messages=[
                    Message(role=MessageRole.SYSTEM, content="You are a fact extraction assistant. Extract clear, factual information from user messages."),
                    Message(role=MessageRole.USER, content=prompt)
                ],
                model=provider.default_model,
                temperature=0.1,
                max_tokens=500
            )
            
            response = await provider.chat_complete(request)
            
            # Parse JSON response
            import json
            try:
                facts_data = json.loads(response.content)
                facts = []
                for fact_data in facts_data:
                    facts.append(ExtractedFact(
                        category=fact_data.get("category", "fact"),
                        content=fact_data.get("content", ""),
                        confidence=fact_data.get("confidence", 0.5),
                        source_message=message
                    ))
                return facts
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            print(f"AI extraction failed: {e}")
            return []
    
    def extract_facts_pattern(self, message: str) -> List[ExtractedFact]:
        """
        Extract facts using regex patterns (fallback method)
        
        Args:
            message: User message to analyze
            
        Returns:
            List of extracted facts
        """
        facts = []
        message_lower = message.lower()
        
        # Check preference patterns
        for pattern in self.PREFERENCE_PATTERNS:
            matches = re.finditer(pattern, message_lower, re.IGNORECASE)
            for match in matches:
                content = match.group(0).capitalize()
                facts.append(ExtractedFact(
                    category="preference",
                    content=content,
                    confidence=0.7,
                    source_message=message
                ))
        
        # Check personal info patterns
        for pattern in self.PERSONAL_INFO_PATTERNS:
            matches = re.finditer(pattern, message_lower, re.IGNORECASE)
            for match in matches:
                content = match.group(0).capitalize()
                facts.append(ExtractedFact(
                    category="personal_info",
                    content=content,
                    confidence=0.8,
                    source_message=message
                ))
        
        # Check date patterns
        for pattern in self.DATE_PATTERNS:
            matches = re.finditer(pattern, message_lower, re.IGNORECASE)
            for match in matches:
                content = match.group(0).capitalize()
                facts.append(ExtractedFact(
                    category="fact",
                    content=content,
                    confidence=0.9,
                    source_message=message
                ))
        
        # Check goal patterns
        for pattern in self.GOAL_PATTERNS:
            matches = re.finditer(pattern, message_lower, re.IGNORECASE)
            for match in matches:
                content = match.group(0).capitalize()
                facts.append(ExtractedFact(
                    category="goal",
                    content=content,
                    confidence=0.6,
                    source_message=message
                ))
        
        # Check skill patterns
        for pattern in self.SKILL_PATTERNS:
            matches = re.finditer(pattern, message_lower, re.IGNORECASE)
            for match in matches:
                content = match.group(0).capitalize()
                facts.append(ExtractedFact(
                    category="skill",
                    content=content,
                    confidence=0.6,
                    source_message=message
                ))
        
        return facts
    
    async def extract_facts(
        self,
        message: str,
        conversation_context: Optional[List[str]] = None,
        use_ai: bool = True
    ) -> List[ExtractedFact]:
        """
        Extract facts from a user message
        
        Args:
            message: User message to analyze
            conversation_context: Previous messages for context
            use_ai: Whether to use AI extraction (fallback to patterns if False or AI fails)
            
        Returns:
            List of extracted facts
        """
        if use_ai:
            ai_facts = await self.extract_facts_ai(message, conversation_context)
            if ai_facts:
                return ai_facts
        
        # Fallback to pattern-based extraction
        return self.extract_facts_pattern(message)
    
    def should_extract(self, message: str, role: str = "user") -> bool:
        """
        Determine if a message should be processed for fact extraction
        
        Args:
            message: Message content
            role: Message role (user/assistant)
            
        Returns:
            True if should extract facts
        """
        # Only extract from user messages
        if role != "user":
            return False
        
        # Skip very short messages
        if len(message) < 10:
            return False
        
        # Skip commands
        if message.startswith(("/", "!", "?")):
            return False
        
        # Check for extraction keywords
        extraction_keywords = [
            "my", "i am", "i'm", "i like", "i love", "i prefer",
            "i work", "i live", "my name", "my birthday",
            "i want", "my goal", "i can", "i know"
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in extraction_keywords)


# Global extractor instance
_extractor: Optional[MemoryExtractor] = None


def get_extractor(provider_id: str = "openai") -> MemoryExtractor:
    """Get or create global extractor instance"""
    global _extractor
    if _extractor is None:
        _extractor = MemoryExtractor(provider_id)
    return _extractor
