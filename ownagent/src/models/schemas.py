"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict


# ========== Base Schemas ==========

class BaseResponse(BaseModel):
    """Base response structure"""
    model_config = ConfigDict(from_attributes=True)
    
    success: bool = True
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class ErrorResponse(BaseModel):
    """Error response structure"""
    success: bool = False
    error: Dict[str, Any]


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = Field(1, ge=1)
    limit: int = Field(20, ge=1, le=100)


class PaginationInfo(BaseModel):
    """Pagination information in responses"""
    page: int
    limit: int
    total: int
    total_pages: int


# ========== Conversation Schemas ==========

class ConversationCreate(BaseModel):
    """Create conversation request"""
    title: Optional[str] = "New Conversation"
    provider: str = "openai"
    model: str = "gpt-4"
    system_prompt: Optional[str] = None


class ConversationUpdate(BaseModel):
    """Update conversation request"""
    title: Optional[str] = None
    is_pinned: Optional[bool] = None


class ConversationResponse(BaseModel):
    """Conversation response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    title: str
    provider: str
    model: str
    message_count: int = 0
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime


class ConversationListResponse(BaseResponse):
    """List conversations response"""


class ConversationDetailResponse(BaseResponse):
    """Single conversation with messages"""


# ========== Message Schemas ==========

class MessageCreate(BaseModel):
    """Create message request"""
    content: str
    provider: Optional[str] = None
    model: Optional[str] = None
    enable_search: bool = False
    temperature: float = Field(0.7, ge=0, le=2)
    max_tokens: Optional[int] = Field(None, ge=1, le=32000)
    file_ids: Optional[List[str]] = None


class MessageResponse(BaseModel):
    """Message response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    role: Literal["system", "user", "assistant", "tool"]
    content: str
    metadata: Optional[Dict[str, Any]] = None
    tokens: Optional[int] = None
    created_at: datetime


class TokenUsage(BaseModel):
    """Token usage information"""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int


class MessageMetadata(BaseModel):
    """Message metadata"""
    provider: str
    model: str
    finish_reason: Optional[str] = None
    usage: Optional[TokenUsage] = None
    search_results: Optional[List[Dict[str, Any]]] = None


# ========== Streaming Schemas ==========

class StreamRequest(BaseModel):
    """Streaming chat request"""
    content: str
    provider: Optional[str] = None
    model: Optional[str] = None
    temperature: float = Field(0.7, ge=0, le=2)
    max_tokens: Optional[int] = None
    conversation_id: Optional[str] = None


class StreamStartEvent(BaseModel):
    """SSE stream start event"""
    message_id: str
    timestamp: datetime


class StreamTokenEvent(BaseModel):
    """SSE token event"""
    token: str
    index: int


class StreamDoneEvent(BaseModel):
    """SSE stream done event"""
    finish_reason: str
    usage: Optional[TokenUsage] = None


class StreamErrorEvent(BaseModel):
    """SSE stream error event"""
    error: str
    code: str


# ========== Provider Schemas ==========

class ProviderModel(BaseModel):
    """AI model information"""
    id: str
    name: str
    supports_vision: bool = False
    supports_streaming: bool = True
    max_tokens: int


class ProviderInfo(BaseModel):
    """Provider information"""
    id: str
    name: str
    status: Literal["available", "unavailable", "error"]
    is_configured: bool
    error: Optional[str] = None
    models: List[ProviderModel]


class ProviderListResponse(BaseResponse):
    """List providers response"""


class ProviderTestResponse(BaseResponse):
    """Test provider response"""


class ProviderConfigRequest(BaseModel):
    """Configure provider request"""
    api_key: str
    base_url: Optional[str] = None


class ProviderConfigResponse(BaseResponse):
    """Provider configuration response"""


# ========== File Schemas ==========

class FileUploadResponse(BaseResponse):
    """File upload response"""


class FileResponse(BaseModel):
    """File metadata response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    filename: str
    original_name: str
    mime_type: str
    size: int
    status: Literal["uploading", "processing", "ready", "error"]
    extracted_text: Optional[str] = None
    word_count: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime
    conversations: Optional[List[str]] = None


class FileListResponse(BaseResponse):
    """List files response"""


# ========== Settings Schemas ==========

class GeneralSettings(BaseModel):
    """General application settings"""
    theme: Literal["dark", "light", "system"] = "dark"
    language: str = "en"
    font_size: Literal["small", "medium", "large"] = "medium"
    enter_to_send: bool = True


class ChatSettings(BaseModel):
    """Chat-related settings"""
    default_provider: str = "openai"
    default_model: str = "gpt-4"
    temperature: float = Field(0.7, ge=0, le=2)
    max_tokens: int = Field(2000, ge=1, le=32000)
    auto_save: bool = True
    show_token_count: bool = True


class ProviderSetting(BaseModel):
    """Provider setting (masked)"""
    api_key: Optional[str] = None  # Masked
    is_configured: bool = False


class FeatureSettings(BaseModel):
    """Feature settings"""
    web_search: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True,
        "default_provider": "perplexity"
    })
    file_upload: Dict[str, Any] = Field(default_factory=lambda: {
        "enabled": True,
        "max_file_size": 10485760,
        "allowed_types": ["pdf", "txt", "md", "csv", "json", "png", "jpg"]
    })


class SettingsResponse(BaseResponse):
    """Get settings response"""


class SettingsUpdateRequest(BaseModel):
    """Update settings request"""
    general: Optional[GeneralSettings] = None
    chat: Optional[ChatSettings] = None
    features: Optional[FeatureSettings] = None


# ========== Memory Schemas ==========

class MemoryFactResponse(BaseModel):
    """Memory fact response"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    category: Literal["preference", "fact", "skill", "goal"]
    content: str
    confidence: float = Field(..., ge=0, le=1)
    source_conversation: Optional[str] = None
    created_at: datetime


class MemoryListResponse(BaseResponse):
    """List memory facts response"""


class MemorySearchRequest(BaseModel):
    """Search memory request"""
    query: str
    limit: int = Field(10, ge=1, le=50)


class MemorySearchResult(BaseModel):
    """Memory search result"""
    conversation_id: str
    conversation_title: str
    message_id: str
    content: str
    similarity: float
    created_at: datetime


class MemorySearchResponse(BaseResponse):
    """Memory search response"""


# ========== Health & Info Schemas ==========

class HealthResponse(BaseResponse):
    """Health check response"""


class InfoResponse(BaseResponse):
    """API info response"""
