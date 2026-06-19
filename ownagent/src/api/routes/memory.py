"""
Memory API Routes
"""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api.dependencies import get_db
from src.models.database import MemoryFact, Conversation
from src.models.schemas import (
    MemoryListResponse, MemorySearchRequest, MemorySearchResponse,
    BaseResponse
)

router = APIRouter(prefix="/api/v1/memory", tags=["memory"])


@router.get("/facts", response_model=MemoryListResponse)
async def list_memory_facts(
    category: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get learned facts/preferences about the user"""
    query = db.query(MemoryFact).filter(MemoryFact.is_active == True)
    
    if category:
        query = query.filter(MemoryFact.category == category)
    
    facts = query.order_by(MemoryFact.confidence.desc()).limit(limit).all()
    
    return MemoryListResponse(
        data={"facts": [fact.to_dict() for fact in facts]}
    )


@router.post("/facts", response_model=BaseResponse, status_code=status.HTTP_201_CREATED)
async def create_memory_fact(
    category: str,
    content: str,
    confidence: float = 1.0,
    conversation_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Create a new memory fact"""
    # Validate conversation if provided
    if conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation not found: {conversation_id}"
            )
    
    import uuid
    fact = MemoryFact(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        category=category,
        content=content,
        confidence=confidence
    )
    
    db.add(fact)
    db.commit()
    db.refresh(fact)
    
    return BaseResponse(data=fact.to_dict())


@router.delete("/facts/{fact_id}", response_model=BaseResponse)
async def delete_memory_fact(
    fact_id: str,
    db: Session = Depends(get_db)
):
    """Delete a memory fact"""
    fact = db.query(MemoryFact).filter(
        MemoryFact.id == fact_id
    ).first()
    
    if not fact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Memory fact not found: {fact_id}"
        )
    
    db.delete(fact)
    db.commit()
    
    return BaseResponse(message="Memory fact deleted successfully")


@router.post("/search", response_model=MemorySearchResponse)
async def search_memory(
    request: MemorySearchRequest,
    db: Session = Depends(get_db)
):
    """Search through conversation history"""
    # Simple text-based search (in production, use vector search)
    from src.models.database import Message
    
    # Search in messages
    messages = db.query(Message).filter(
        Message.content.ilike(f"%{request.query}%")
    ).limit(request.limit).all()
    
    results = []
    for msg in messages:
        if msg.conversation:
            results.append({
                "conversation_id": msg.conversation_id,
                "conversation_title": msg.conversation.title,
                "message_id": msg.id,
                "content": msg.content[:200] + "..." if len(msg.content) > 200 else msg.content,
                "similarity": 0.8,  # Placeholder
                "created_at": msg.created_at.isoformat() if msg.created_at else None
            })
    
    return MemorySearchResponse(data={"results": results})
