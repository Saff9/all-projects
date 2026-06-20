"""
Base AI Provider Interface
Defines the contract that all AI provider adapters must implement
"""
from abc import ABC, abstractmethod
from typing import AsyncIterator, Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum


class MessageRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


@dataclass
class Message:
    """Chat message"""
    role: MessageRole
    content: str
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class ChatCompletionRequest:
    """Chat completion request"""
    messages: List[Message]
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    stream: bool = False
    system_prompt: Optional[str] = None


@dataclass
class ChatCompletionResponse:
    """Chat completion response"""
    content: str
    model: str
    finish_reason: str
    usage: Dict[str, int]
    metadata: Optional[Dict[str, Any]] = None


@dataclass
class StreamChunk:
    """Streaming response chunk"""
    content: str
    is_finished: bool = False
    finish_reason: Optional[str] = None
    usage: Optional[Dict[str, int]] = None


@dataclass
class ProviderModel:
    """AI model information"""
    id: str
    name: str
    max_tokens: int
    supports_vision: bool = False
    supports_streaming: bool = True


class BaseAIProvider(ABC):
    """Base class for AI provider adapters"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        self.api_key = api_key
        self.base_url = base_url
        self._client = None
    
    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique provider identifier"""
        pass
    
    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable provider name"""
        pass
    
    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model for this provider"""
        pass
    
    @abstractmethod
    def get_models(self) -> List[ProviderModel]:
        """Get list of available models"""
        pass
    
    @abstractmethod
    async def chat_complete(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        """
        Send a chat completion request (non-streaming)
        
        Args:
            request: Chat completion request
            
        Returns:
            Chat completion response
        """
        pass
    
    @abstractmethod
    async def chat_complete_stream(
        self, 
        request: ChatCompletionRequest
    ) -> AsyncIterator[StreamChunk]:
        """
        Send a chat completion request (streaming)
        
        Args:
            request: Chat completion request
            
        Yields:
            Stream chunks
        """
        pass
    
    @abstractmethod
    async def validate_connection(self) -> Dict[str, Any]:
        """
        Validate provider connection
        
        Returns:
            Dict with 'valid' (bool) and optional 'error' (str) keys
        """
        pass
    
    def format_messages(self, messages: List[Message]) -> List[Dict[str, str]]:
        """
        Format messages for the provider's API
        Override in subclass if provider needs special formatting
        
        Args:
            messages: List of messages
            
        Returns:
            Formatted messages
        """
        return [
            {"role": msg.role.value, "content": msg.content}
            for msg in messages
        ]
    
    def handle_error(self, error: Exception) -> Dict[str, Any]:
        """
        Handle provider-specific errors
        Override in subclass for custom error handling
        
        Args:
            error: The exception that occurred
            
        Returns:
            Error details dict
        """
        return {
            "error": str(error),
            "type": type(error).__name__,
        }
