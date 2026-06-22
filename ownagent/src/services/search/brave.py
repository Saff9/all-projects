"""
Brave Search API provider integration
Provides web search capabilities using Brave Search API
"""
import os
import time
from typing import Optional, Literal
import httpx

from src.services.search.base import BaseSearchProvider, SearchResponse, SearchResult


class BraveSearchProvider(BaseSearchProvider):
    """Brave Search API provider"""
    
    API_BASE_URL = "https://api.search.brave.com/res/v1/web/search"
    NEWS_API_URL = "https://api.search.brave.com/res/v1/news/search"
    IMAGES_API_URL = "https://api.search.brave.com/res/v1/images/search"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(api_key or os.getenv("BRAVE_API_KEY"), **kwargs)
    
    @property
    def provider_id(self) -> str:
        return "brave"
    
    @property
    def provider_name(self) -> str:
        return "Brave Search"
    
    def is_available(self) -> bool:
        """Check if API key is configured"""
        return self.api_key is not None and len(self.api_key) > 0
    
    async def search(
        self,
        query: str,
        num_results: int = 10,
        search_type: Literal["general", "news", "images"] = "general",
        **kwargs
    ) -> SearchResponse:
        """
        Perform web search using Brave Search API
        
        Args:
            query: Search query
            num_results: Number of results (max 20 per request)
            search_type: Type of search
            
        Returns:
            SearchResponse with results
        """
        if not self.is_available():
            raise ValueError("Brave API key not configured")
        
        start_time = time.time()
        
        # Select appropriate endpoint
        if search_type == "news":
            url = self.NEWS_API_URL
        elif search_type == "images":
            url = self.IMAGES_API_URL
        else:
            url = self.API_BASE_URL
        
        # Build headers
        headers = {
            "X-Subscription-Token": self.api_key,
            "Accept": "application/json"
        }
        
        # Build parameters
        params = {
            "q": query,
            "count": min(num_results, 20),
            "offset": kwargs.get("offset", 0)
        }
        
        # Add search filters
        if "freshness" in kwargs:
            params["freshness"] = kwargs["freshness"]  # pd (past day), pw (past week), pm (past month)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
        
        search_time = time.time() - start_time
        
        # Parse results
        results = []
        
        if search_type == "news":
            news_results = data.get("results", [])
            for item in news_results[:num_results]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("description", ""),
                    source=item.get("meta", {}).get("domain", "Unknown"),
                    published_date=item.get("meta", {}).get("age", None)
                ))
        elif search_type == "images":
            image_results = data.get("results", [])
            for item in image_results[:num_results]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("description", ""),
                    source=item.get("source", "Unknown"),
                    thumbnail=item.get("thumbnail", {}).get("src", None)
                ))
        else:
            # General web search
            web_results = data.get("web", {}).get("results", [])
            for item in web_results[:num_results]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    url=item.get("url", ""),
                    snippet=item.get("description", ""),
                    source=item.get("meta", {}).get("domain", "Unknown"),
                    published_date=item.get("age", None)
                ))
        
        return SearchResponse(
            results=results,
            query=query,
            total_results=len(results),
            search_time=search_time,
            provider=self.provider_id
        )
