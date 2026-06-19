"""
Chat API Routes
"""
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from src.api.dependencies import get_db, get_provider, get_provider_manager, ProviderManager
from src.models.database import Conversation, Message, ProviderConfig
from src.models.schemas import (
    ConversationCreate, ConversationUpdate, ConversationResponse,
    MessageCreate, MessageResponse, StreamRequest,
    ConversationListResponse, ConversationDetailResponse,
    BaseResponse
)
from src.services.ai import Message as AIMessage, MessageRole, ChatCompletionRequest
from src.core.exceptions import ProviderError, NotFoundError

router = APIRouter(prefix="/api/v1", tags=["chat"])


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    page: int = 1,
    limit: int = 20,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all conversations"""
    query = db.query(Conversation)
    
    if search:
        # Use parameterized query to prevent SQL injection
        query = query.filter(Conversation.title.ilike(f"%{search}%"))
    
    total = query.count()
    conversations = query.order_by(Conversation.updated_at.desc()).offset(
        (page - 1) * limit
    ).limit(limit).all()
    
    return ConversationListResponse(
        data={
            "conversations": [conv.to_dict() for conv in conversations],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "total_pages": (total + limit - 1) // limit
            }
        }
    )


@router.post("/conversations", response_model=ConversationDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db)
):
    """Create a new conversation"""
    from src.services.ai import get_provider_class
    
    # Validate provider exists
    provider_class = get_provider_class(request.provider)
    if not provider_class:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown provider: {request.provider}. Available providers: {', '.join(get_all_provider_ids())}"
        )
    
    # Validate model if provided
    if request.model:
        available_models = [m.id for m in provider_class.get_models()]
        if request.model not in available_models:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Model '{request.model}' not available for provider '{request.provider}'. Available models: {', '.join(available_models)}"
            )
    
    conversation = Conversation(
        id=str(uuid.uuid4()),
        title=request.title or "New Conversation",
        provider=request.provider,
        model=request.model or provider_class.default_model,
        system_prompt=request.system_prompt
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    # Add system message if system prompt provided
    if request.system_prompt:
        system_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation.id,
            role="system",
            content=request.system_prompt
        )
        db.add(system_message)
        db.commit()
    
    return ConversationDetailResponse(
        data=conversation.to_dict(include_messages=True)
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get a specific conversation with messages"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation not found: {conversation_id}"
        )
    
    return ConversationDetailResponse(
        data=conversation.to_dict(include_messages=True)
    )


@router.patch("/conversations/{conversation_id}", response_model=ConversationDetailResponse)
async def update_conversation(
    conversation_id: str,
    request: ConversationUpdate,
    db: Session = Depends(get_db)
):
    """Update conversation metadata"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation not found: {conversation_id}"
        )
    
    if request.title is not None:
        conversation.title = request.title
    if request.is_pinned is not None:
        conversation.is_pinned = request.is_pinned
    
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    
    return ConversationDetailResponse(
        data=conversation.to_dict(include_messages=True)
    )


@router.delete("/conversations/{conversation_id}", response_model=BaseResponse)
async def delete_conversation(
    conversation_id: str,
    db: Session = Depends(get_db)
):
    """Delete a conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation not found: {conversation_id}"
        )
    
    db.delete(conversation)
    db.commit()
    
    return BaseResponse(message="Conversation deleted successfully")


@router.post("/conversations/{conversation_id}/messages", response_model=BaseResponse)
async def send_message(
    conversation_id: str,
    request: MessageCreate,
    db: Session = Depends(get_db),
    provider_manager: ProviderManager = Depends(get_provider_manager)
):
    """Send a message and get a response (non-streaming)"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation not found: {conversation_id}"
        )
    
    # Use conversation provider/model or override from request
    provider_id = request.provider or conversation.provider
    model = request.model or conversation.model
    
    # Get provider instance
    try:
        provider = provider_manager.get_provider_instance(provider_id)
    except ProviderError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Save user message
    user_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=request.content
    )
    db.add(user_message)
    db.commit()
    
    # Build message history
    messages = []
    for msg in conversation.messages:
        role = MessageRole(msg.role) if msg.role in [r.value for r in MessageRole] else MessageRole.USER
        messages.append(AIMessage(role=role, content=msg.content))
    
    # Add current message
    messages.append(AIMessage(role=MessageRole.USER, content=request.content))
    
    # Create completion request
    completion_request = ChatCompletionRequest(
        messages=messages,
        model=model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        stream=False,
        system_prompt=conversation.system_prompt
    )
    
    try:
        # Get response from provider
        response = await provider.chat_complete(completion_request)
        
        # Save assistant message
        assistant_message = Message(
            id=str(uuid.uuid4()),
            conversation_id=conversation_id,
            role="assistant",
            content=response.content,
            metadata={
                "provider": provider_id,
                "model": response.model,
                "finish_reason": response.finish_reason,
                "usage": response.usage
            },
            tokens=response.usage.get("total_tokens") if response.usage else None
        )
        db.add(assistant_message)
        db.commit()
        
        return BaseResponse(
            data={
                "message": {
                    "id": assistant_message.id,
                    "role": "assistant",
                    "content": response.content,
                    "created_at": assistant_message.created_at.isoformat(),
                    "tokens": assistant_message.tokens,
                    "metadata": assistant_message.metadata
                }
            }
        )
        
    except ProviderError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.post("/conversations/{conversation_id}/stream")
async def stream_message(
    conversation_id: str,
    request: StreamRequest,
    db: Session = Depends(get_db),
    provider_manager: ProviderManager = Depends(get_provider_manager)
):
    """Send a message and stream the response (SSE)"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation not found: {conversation_id}"
        )
    
    # Use conversation provider/model or override from request
    provider_id = request.provider or conversation.provider
    model = request.model or conversation.model
    
    # Get provider instance
    try:
        provider = provider_manager.get_provider_instance(provider_id)
    except ProviderError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Save user message
    user_message = Message(
        id=str(uuid.uuid4()),
        conversation_id=conversation_id,
        role="user",
        content=request.content
    )
    db.add(user_message)
    db.commit()
    
    # Build message history
    messages = []
    for msg in conversation.messages:
        role = MessageRole(msg.role) if msg.role in [r.value for r in MessageRole] else MessageRole.USER
        messages.append(AIMessage(role=role, content=msg.content))
    
    # Create completion request
    completion_request = ChatCompletionRequest(
        messages=messages,
        model=model,
        temperature=request.temperature,
        max_tokens=request.max_tokens,
        stream=True,
        system_prompt=conversation.system_prompt
    )
    
    async def event_generator():
        """Generate SSE events"""
        message_id = str(uuid.uuid4())
        full_content = ""
        
        # Send start event
        yield f"event: start\ndata: {{\"message_id\": \"{message_id}\", \"timestamp\": \"{datetime.utcnow().isoformat()}\"}}\n\n"
        
        try:
            index = 0
            async for chunk in provider.chat_complete_stream(completion_request):
                if not chunk.is_finished and chunk.content:
                    full_content += chunk.content
                    yield f"event: token\ndata: {{\"token\": {__import__('json').dumps(chunk.content)}, \"index\": {index}}}\n\n"
                    index += 1
                
                if chunk.is_finished:
                    # Save assistant message
                    assistant_message = Message(
                        id=message_id,
                        conversation_id=conversation_id,
                        role="assistant",
                        content=full_content,
                        metadata={
                            "provider": provider_id,
                            "model": model,
                            "finish_reason": chunk.finish_reason or "stop"
                        }
                    )
                    db.add(assistant_message)
                    db.commit()
                    
                    yield f"event: done\ndata: {{\"finish_reason\": \"{chunk.finish_reason or 'stop'}\"}}\n\n"
                    
        except Exception as e:
            # Log the actual error but send sanitized message to client
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Stream error for conversation {conversation_id}: {str(e)}")
            yield f"event: error\ndata: {{\"error\": \"An error occurred while processing your request\", \"code\": \"STREAM_ERROR\"}}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


@router.delete("/conversations/{conversation_id}/messages/{message_id}", response_model=BaseResponse)
async def delete_message(
    conversation_id: str,
    message_id: str,
    db: Session = Depends(get_db)
):
    """Delete a message and all subsequent messages"""
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.conversation_id == conversation_id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message not found: {message_id}"
        )
    
    # Delete this message and all subsequent messages
    db.query(Message).filter(
        Message.conversation_id == conversation_id,
        Message.created_at >= message.created_at
    ).delete()
    
    db.commit()
    
    return BaseResponse(message="Messages deleted successfully")
