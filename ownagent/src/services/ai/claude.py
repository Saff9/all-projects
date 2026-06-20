"""
Anthropic Claude Provider Adapter
"""
from typing import AsyncIterator, Dict, Any, List, Optional

import anthropic
from anthropic import AsyncAnthropic

from src.services.ai.base import (
    BaseAIProvider, ChatCompletionRequest, ChatCompletionResponse,
    StreamChunk, ProviderModel, Message, MessageRole
)
from src.core.exceptions import ProviderError, RateLimitError


class ClaudeProvider(BaseAIProvider):
    """Anthropic Claude API adapter"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self._client = AsyncAnthropic(
            api_key=api_key,
            base_url=base_url
        )
    
    @property
    def provider_id(self) -> str:
        return "claude"
    
    @property
    def provider_name(self) -> str:
        return "Claude (Anthropic)"
    
    @property
    def default_model(self) -> str:
        return "claude-3-sonnet-20240229"
    
    def get_models(self) -> List[ProviderModel]:
        return [
            ProviderModel(
                id="claude-3-opus-20240229",
                name="Claude 3 Opus",
                max_tokens=4096,
                supports_vision=True,
                supports_streaming=True
            ),
            ProviderModel(
                id="claude-3-sonnet-20240229",
                name="Claude 3 Sonnet",
                max_tokens=4096,
                supports_vision=True,
                supports_streaming=True
            ),
            ProviderModel(
                id="claude-3-haiku-20240307",
                name="Claude 3 Haiku",
                max_tokens=4096,
                supports_vision=True,
                supports_streaming=True
            ),
        ]
    
    def _convert_messages(self, messages: List[Message]) -> tuple:
        """
        Convert messages to Claude format
        Returns (system, messages) tuple
        """
        system = None
        claude_messages = []
        
        for msg in messages:
            if msg.role == MessageRole.SYSTEM:
                system = msg.content
            elif msg.role == MessageRole.USER:
                claude_messages.append({
                    "role": "user",
                    "content": msg.content
                })
            elif msg.role == MessageRole.ASSISTANT:
                claude_messages.append({
                    "role": "assistant",
                    "content": msg.content
                })
        
        return system, claude_messages
    
    async def chat_complete(self, request: ChatCompletionRequest) -> ChatCompletionResponse:
        """Send non-streaming chat completion request"""
        try:
            system, messages = self._convert_messages(request.messages)
            
            # Override system if provided in request
            if request.system_prompt:
                system = request.system_prompt
            
            params: Dict[str, Any] = {
                "model": request.model or self.default_model,
                "messages": messages,
                "max_tokens": request.max_tokens or 4096,
                "temperature": request.temperature,
            }
            
            if system:
                params["system"] = system
            
            response = await self._client.messages.create(**params)
            
            content = ""
            if response.content:
                for block in response.content:
                    if hasattr(block, 'text'):
                        content += block.text
            
            return ChatCompletionResponse(
                content=content,
                model=response.model,
                finish_reason=response.stop_reason or "stop",
                usage={
                    "prompt_tokens": response.usage.input_tokens if response.usage else 0,
                    "completion_tokens": response.usage.output_tokens if response.usage else 0,
                    "total_tokens": (response.usage.input_tokens + response.usage.output_tokens) if response.usage else 0,
                }
            )
            
        except anthropic.RateLimitError as e:
            raise RateLimitError(self.provider_id)
        except Exception as e:
            raise ProviderError(str(e), self.provider_id)
    
    async def chat_complete_stream(
        self, 
        request: ChatCompletionRequest
    ) -> AsyncIterator[StreamChunk]:
        """Send streaming chat completion request"""
        try:
            system, messages = self._convert_messages(request.messages)
            
            # Override system if provided in request
            if request.system_prompt:
                system = request.system_prompt
            
            params: Dict[str, Any] = {
                "model": request.model or self.default_model,
                "messages": messages,
                "max_tokens": request.max_tokens or 4096,
                "temperature": request.temperature,
                "stream": True,
            }
            
            if system:
                params["system"] = system
            
            async with self._client.messages.stream(**params) as stream:
                async for text in stream.text_stream:
                    yield StreamChunk(
                        content=text,
                        is_finished=False
                    )
                
                # Get final message for finish reason
                final_message = await stream.get_final_message()
                yield StreamChunk(
                    content="",
                    is_finished=True,
                    finish_reason=final_message.stop_reason or "stop"
                )
                    
        except anthropic.RateLimitError as e:
            raise RateLimitError(self.provider_id)
        except Exception as e:
            raise ProviderError(str(e), self.provider_id)
    
    async def validate_connection(self) -> Dict[str, Any]:
        """Validate Claude connection"""
        try:
            # Try a simple request to validate
            response = await self._client.messages.create(
                model=self.default_model,
                messages=[{"role": "user", "content": "Hi"}],
                max_tokens=1
            )
            return {"valid": True}
        except anthropic.AuthenticationError:
            return {"valid": False, "error": "Invalid API key"}
        except Exception as e:
            return {"valid": False, "error": str(e)}
