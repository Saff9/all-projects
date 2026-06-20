"""
OpenAI Provider Adapter
"""
import os
from typing import AsyncIterator, Dict, Any, List, Optional

from openai import AsyncOpenAI, AuthenticationError, RateLimitError as OpenAIRateLimitError

from src.services.ai.base import (
    BaseAIProvider, ChatCompletionRequest, ChatCompletionResponse,
    StreamChunk, ProviderModel, Message, MessageRole
)
from src.core.exceptions import ProviderError, RateLimitError


class OpenAIProvider(BaseAIProvider):
    """OpenAI API adapter"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url or "https://api.openai.com/v1"
        )
    
    @property
    def provider_id(self) -> str:
        return "openai"
    
    @property
    def provider_name(self) -> str:
        return "OpenAI"
    
    @property
    def default_model(self) -> str:
        return "gpt-4"
    
    def get_models(self) -> List[ProviderModel]:
        return [
            ProviderModel(
                id="gpt-4",
                name="GPT-4",
                max_tokens=8192,
                supports_vision=True,
                supports_streaming=True
            ),
            ProviderModel(
                id="gpt-4-turbo",
                name="GPT-4 Turbo",
                max_tokens=128000,
                supports_vision=True,
                supports_streaming=True
            ),
            ProviderModel(
                id="gpt-3.5-turbo",
                name="GPT-3.5 Turbo",
                max_tokens=16385,
                supports_vision=False,
                supports_streaming=True
            ),
        ]
    
    def format_messages(self, messages: List[Message]) -> List[Dict[str, str]]:
        """Format messages for OpenAI API"""
        formatted = []
        for msg in messages:
            formatted.append({
                "role": msg.role.value,
                "content": msg.content
            })
        return formatted
    
    async def chat_complete(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        """Send non-streaming chat completion request"""
        try:
            messages = self.format_messages(request.messages)
            
            # Add system prompt if provided
            if request.system_prompt:
                messages.insert(0, {
                    "role": "system",
                    "content": request.system_prompt
                })
            
            params: Dict[str, Any] = {
                "model": request.model or self.default_model,
                "messages": messages,
                "temperature": request.temperature,
                "stream": False,
            }
            
            if request.max_tokens:
                params["max_tokens"] = request.max_tokens
            
            response = await self._client.chat.completions.create(**params)
            
            return ChatCompletionResponse(
                content=response.choices[0].message.content or "",
                model=response.model,
                finish_reason=response.choices[0].finish_reason or "stop",
                usage={
                    "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
                    "completion_tokens": response.usage.completion_tokens if response.usage else 0,
                    "total_tokens": response.usage.total_tokens if response.usage else 0,
                }
            )
            
        except OpenAIRateLimitError as e:
            raise RateLimitError(self.provider_id)
        except Exception as e:
            raise ProviderError(str(e), self.provider_id)
    
    async def chat_complete_stream(
        self, 
        request: ChatCompletionRequest
    ) -> AsyncIterator[StreamChunk]:
        """Send streaming chat completion request"""
        try:
            messages = self.format_messages(request.messages)
            
            # Add system prompt if provided
            if request.system_prompt:
                messages.insert(0, {
                    "role": "system",
                    "content": request.system_prompt
                })
            
            params: Dict[str, Any] = {
                "model": request.model or self.default_model,
                "messages": messages,
                "temperature": request.temperature,
                "stream": True,
            }
            
            if request.max_tokens:
                params["max_tokens"] = request.max_tokens
            
            stream = await self._client.chat.completions.create(**params)
            
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    yield StreamChunk(
                        content=chunk.choices[0].delta.content,
                        is_finished=False
                    )
                
                if chunk.choices and chunk.choices[0].finish_reason:
                    yield StreamChunk(
                        content="",
                        is_finished=True,
                        finish_reason=chunk.choices[0].finish_reason
                    )
                    
        except OpenAIRateLimitError as e:
            raise RateLimitError(self.provider_id)
        except Exception as e:
            raise ProviderError(str(e), self.provider_id)
    
    async def validate_connection(self) -> Dict[str, Any]:
        """Validate OpenAI connection"""
        try:
            # Try to list models as a simple validation
            await self._client.models.list()
            return {"valid": True}
        except AuthenticationError:
            return {"valid": False, "error": "Invalid API key"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
