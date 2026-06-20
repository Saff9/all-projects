"""
AI Provider Adapters
"""
from src.services.ai.base import (
    BaseAIProvider,
    ChatCompletionRequest,
    ChatCompletionResponse,
    StreamChunk,
    ProviderModel,
    Message,
    MessageRole,
)
from src.services.ai.openai import OpenAIProvider
from src.services.ai.claude import ClaudeProvider
from src.services.ai.deepseek import DeepSeekProvider
from src.services.ai.grok import GrokProvider
from src.services.ai.openrouter import OpenRouterProvider
from src.services.ai.perplexity import PerplexityProvider

__all__ = [
    "BaseAIProvider",
    "ChatCompletionRequest",
    "ChatCompletionResponse",
    "StreamChunk",
    "ProviderModel",
    "Message",
    "MessageRole",
    "OpenAIProvider",
    "ClaudeProvider",
    "DeepSeekProvider",
    "GrokProvider",
    "OpenRouterProvider",
    "PerplexityProvider",
]

# Provider registry
PROVIDER_CLASSES = {
    "openai": OpenAIProvider,
    "claude": ClaudeProvider,
    "deepseek": DeepSeekProvider,
    "grok": GrokProvider,
    "openrouter": OpenRouterProvider,
    "perplexity": PerplexityProvider,
}


def get_provider_class(provider_id: str):
    """Get provider class by ID"""
    return PROVIDER_CLASSES.get(provider_id)


def get_all_provider_ids() -> list:
    """Get all available provider IDs"""
    return list(PROVIDER_CLASSES.keys())
