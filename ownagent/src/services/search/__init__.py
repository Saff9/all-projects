"""
Search service module for Apex Smart
Provides web search capabilities with multiple provider support
"""
from typing import Optional, Dict, Type, List, Literal
from datetime import datetime, timedelta
import hashlib

from src.services.search.base import BaseSearchProvider, SearchResponse
from src.services.search.serpapi import SerpAPISearchProvider
from src.services.search.brave import BraveSearchProvider
from src.services.search.duckduckgo import DuckDuckGoSearchProvider, DuckDuckGoLiteProvider


# Registry of available search providers
_SEARCH_PROVIDERS: Dict[str, Type[BaseSearchProvider]] = {
    "serpapi": SerpAPISearchProvider,
    "brave": BraveSearchProvider,
    "duckduckgo": DuckDuckGoSearchProvider,
    "duckduckgo_lite": DuckDuckGoLiteProvider,
}

# Cache for search results (simple in-memory cache)
_search_cache: Dict[str, Dict] = {}
CACHE_TTL_HOURS = 1


def get_search_provider(provider_id: str, **kwargs) -> Optional[BaseSearchProvider]:
    """
    Get a search provider instance
    
    Args:
        provider_id: Provider identifier
        **kwargs: Additional configuration options
        
    Returns:
        Search provider instance or None if not found
    """
    provider_class = _SEARCH_PROVIDERS.get(provider_id)
    if provider_class:
        return provider_class(**kwargs)
    return None


def get_available_providers() -> List[str]:
    """Get list of available provider IDs"""
    return list(_SEARCH_PROVIDERS.keys())


def get_default_provider() -> BaseSearchProvider:
    """
    Get the default search provider
    Tries providers in order: brave -> serpapi -> duckduckgo
    """
    # Try Brave first
    brave = BraveSearchProvider()
    if brave.is_available():
        return brave
    
    # Try SerpAPI
    serpapi = SerpAPISearchProvider()
    if serpapi.is_available():
        return serpapi
    
    # Fall back to DuckDuckGo (always available)
    return DuckDuckGoSearchProvider()


def _get_cache_key(query: str, provider: str, search_type: str, **kwargs) -> str:
    """Generate cache key for search query"""
    key_data = f"{query}:{provider}:{search_type}:{sorted(kwargs.items())}"
    return hashlib.md5(key_data.encode()).hexdigest()


def _get_cached_result(cache_key: str) -> Optional[SearchResponse]:
    """Get cached search result if valid"""
    if cache_key in _search_cache:
        cached = _search_cache[cache_key]
        if datetime.utcnow() < cached["expires_at"]:
            response = cached["response"]
            response.cached = True
            return response
        else:
            del _search_cache[cache_key]
    return None


def _cache_result(cache_key: str, response: SearchResponse) -> None:
    """Cache search result"""
    _search_cache[cache_key] = {
        "response": response,
        "expires_at": datetime.utcnow() + timedelta(hours=CACHE_TTL_HOURS)
    }


async def search_web(
    query: str,
    provider_id: Optional[str] = None,
    num_results: int = 10,
    search_type: Literal["general", "news", "images"] = "general",
    use_cache: bool = True,
    **kwargs
) -> SearchResponse:
    """
    Perform web search with caching support
    
    Args:
        query: Search query
        provider_id: Provider to use (auto-selected if None)
        num_results: Number of results to return
        search_type: Type of search
        use_cache: Whether to use caching
        **kwargs: Additional search parameters
        
    Returns:
        SearchResponse with results
    """
    # Get provider
    if provider_id:
        provider = get_search_provider(provider_id, **kwargs)
        if not provider:
            raise ValueError(f"Unknown search provider: {provider_id}")
    else:
        provider = get_default_provider()
    
    # Check cache
    if use_cache:
        cache_key = _get_cache_key(query, provider.provider_id, search_type, **kwargs)
        cached = _get_cached_result(cache_key)
        if cached:
            return cached
    
    # Perform search
    response = await provider.search(
        query=query,
        num_results=num_results,
        search_type=search_type,
        **kwargs
    )
    
    # Cache result
    if use_cache:
        _cache_result(cache_key, response)
    
    return response


def clear_search_cache() -> None:
    """Clear all cached search results"""
    _search_cache.clear()


def get_search_cache_stats() -> Dict:
    """Get cache statistics"""
    now = datetime.utcnow()
    valid_entries = sum(
        1 for entry in _search_cache.values()
        if entry["expires_at"] > now
    )
    return {
        "total_entries": len(_search_cache),
        "valid_entries": valid_entries,
        "expired_entries": len(_search_cache) - valid_entries
    }


__all__ = [
    "BaseSearchProvider",
    "SearchResponse",
    "SerpAPISearchProvider",
    "BraveSearchProvider",
    "DuckDuckGoSearchProvider",
    "DuckDuckGoLiteProvider",
    "get_search_provider",
    "get_available_providers",
    "get_default_provider",
    "search_web",
    "clear_search_cache",
    "get_search_cache_stats"
]
