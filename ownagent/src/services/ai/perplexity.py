"""
Perplexity Provider Adapter
Supports both chat and search capabilities
"""
from typing import AsyncIterator, Dict, Any, List, Optional

import httpx

from src.services.ai.base import (
    BaseAIProvider, ChatCompletionRequest, ChatCompletionResponse,
    StreamChunk, ProviderModel, Message, MessageRole
)
from src.core.exceptions import ProviderError, RateLimitError


class PerplexityProvider(BaseAIProvider):
    """Perplexity API adapter (OpenAI-compatible)"""
    
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        super().__init__(api_key, base_url)
        self.base_url = base_url or "https://api.perplexity.ai"
        self._headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    @property
    def provider_id(self) -> str:
        return "perplexity"
    
    @property
    def provider_name(self) -> str:
        return "Perplexity"
    
    @property
    def default_model(self) -> str:
        return "llama-3.1-sonar-large-128k-online"
    
    def get_models(self) -> List[ProviderModel]:
        return [
            ProviderModel(
                id="llama-3.1-sonar-large-128k-online",
                name="Sonar Large (Online)",
                max_tokens=8192,
                supports_vision=False,
                supports_streaming=True
            ),
            ProviderModel(
                id="llama-3.1-sonar-small-128k-online",
                name="Sonar Small (Online)",
                max_tokens=8192,
                supports_vision=False,
                supports_streaming=True
            ),
            ProviderModel(
                id="llama-3.1-sonar-large-128k-chat",
                name="Sonar Large (Chat)",
                max_tokens=8192,
                supports_vision=False,
                supports_streaming=True
            ),
            ProviderModel(
                id="llama-3.1-8b-instruct",
                name="Llama 3.1 8B",
                max_tokens=8192,
                supports_vision=False,
                supports_streaming=True
            ),
        ]
    
    def format_messages(self, messages: List[Message]) -> List[Dict[str, str]]:
        """Format messages for Perplexity API"""
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
            
            payload: Dict[str, Any] = {
                "model": request.model or self.default_model,
                "messages": messages,
                "temperature": request.temperature,
                "stream": False,
            }
            
            if request.max_tokens:
                payload["max_tokens"] = request.max_tokens
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._headers,
                    json=payload,
                    timeout=120.0
                )
                
                if response.status_code == 429:
                    raise RateLimitError(self.provider_id)
                
                response.raise_for_status()
                data = response.json()
                
                # Perplexity includes citations in the response
                metadata = {}
                if "citations" in data:
                    metadata["citations"] = data["citations"]
                
                return ChatCompletionResponse(
                    content=data["choices"][0]["message"]["content"],
                    model=data.get("model", request.model or self.default_model),
                    finish_reason=data["choices"][0].get("finish_reason", "stop"),
                    usage=data.get("usage", {
                        "prompt_tokens": 0,
                        "completion_tokens": 0,
                        "total_tokens": 0
                    }),
                    metadata=metadata
                )
                    
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise RateLimitError(self.provider_id)
            raise ProviderError(f"HTTP {e.response.status_code}: {e.response.text}", self.provider_id)
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
            
            payload: Dict[str, Any] = {
                "model": request.model or self.default_model,
                "messages": messages,
                "temperature": request.temperature,
                "stream": True,
            }
            
            if request.max_tokens:
                payload["max_tokens"] = request.max_tokens
            
            async with httpx.AsyncClient() as client:
                async with client.stream(
                    "POST",
                    f"{self.base_url}/chat/completions",
                    headers=self._headers,
                    json=payload,
                    timeout=120.0
                ) as response:
                    if response.status_code == 429:
                        raise RateLimitError(self.provider_id)
                    
                    response.raise_for_status()
                    
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if not line or line == "data: [DONE]":
                            continue
                        
                        if line.startswith("data: "):
                            import json
                            try:
                                data = json.loads(line[6:])
                                if "choices" in data and len(data["choices"]) > 0:
                                    choice = data["choices"][0]
                                    if "delta" in choice and "content" in choice["delta"]:
                                        yield StreamChunk(
                                            content=choice["delta"]["content"],
                                            is_finished=False
                                        )
                                    if choice.get("finish_reason"):
                                        yield StreamChunk(
                                            content="",
                                            is_finished=True,
                                            finish_reason=choice["finish_reason"]
                                        )
                            except json.JSONDecodeError:
                                continue
                    
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                raise RateLimitError(self.provider_id)
            raise ProviderError(f"HTTP {e.response.status_code}: {e.response.text}", self.provider_id)
        except Exception as e:
            raise ProviderError(str(e), self.provider_id)
    
    async def validate_connection(self) -> Dict[str, Any]:
        """Validate Perplexity connection"""
        try:
            # Try a simple request to validate
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._headers,
                    json={
                        "model": self.default_model,
                        "messages": [{"role": "user", "content": "Hi"}],
                        "max_tokens": 1
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return {"valid": True}
                elif response.status_code == 401:
                    return {"valid": False, "error": "Invalid API key"}
                else:
                    return {"valid": False, "error": f"HTTP {response.status_code}"}
                    
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    async def search(self, query: str, model: Optional[str] = None) -> Dict[str, Any]:
        """
        Perform a web search using Perplexity
        
        Args:
            query: Search query
            model: Model to use (defaults to online model)
            
        Returns:
            Search results with citations
        """
        try:
            # Use an online model for search
            search_model = model or "llama-3.1-sonar-large-128k-online"
            
            payload: Dict[str, Any] = {
                "model": search_model,
                "messages": [
                    {"role": "system", "content": "Be precise and concise."},
                    {"role": "user", "content": query}
                ],
                "temperature": 0.2,
                "stream": False,
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=self._headers,
                    json=payload,
                    timeout=60.0
                )
                
                response.raise_for_status()
                data = response.json()
                
                return {
                    "answer": data["choices"][0]["message"]["content"],
                    "citations": data.get("citations", []),
                    "model": data.get("model", search_model),
                    "usage": data.get("usage", {})
                }
                    
        except Exception as e:
            raise ProviderError(f"Search failed: {str(e)}", self.provider_id)
