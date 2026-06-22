"""
SerpAPI search provider integration
Provides web search capabilities using SerpAPI (Google Search API)
"""
import os
import time
from typing import Optional, Literal
import httpx

from src.services.search.base import BaseSearchProvider, SearchResponse, SearchResult


class SerpAPISearchProvider(BaseSearchProvider):
    """SerpAPI search provider"""
    
    API_BASE_URL = "https://serpapi.com/search"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(api_key or os.getenv("SERPAPI_API_KEY"), **kwargs)
        self.engine = kwargs.get("engine", "google")
    
    @property
    def provider_id(self) -> str:
        return "serpapi"
    
    @property
    def provider_name(self) -> str:
        return "SerpAPI (Google)"
    
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
        Perform web search using SerpAPI
        
        Args:
            query: Search query
            num_results: Number of results (max 100)
            search_type: Type of search
            
        Returns:
            SearchResponse with results
        """
        if not self.is_available():
            raise ValueError("SerpAPI key not configured")
        
        start_time = time.time()
        
        # Build search parameters
        params = {
            "q": query,
            "api_key": self.api_key,
            "engine": self.engine,
            "num": min(num_results, 100),
        }
        
        # Add search type specific parameters
        if search_type == "news":
            params["tbm"] = "nws"
        elif search_type == "images":
            params["tbm"] = "isch"
        
        # Add any additional parameters
        params.update(kwargs)
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(self.API_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        
        search_time = time.time() - start_time
        
        # Parse results based on search type
        results = []
        
        if search_type == "news":
            # Parse news results
            news_results = data.get("news_results", [])
            for item in news_results[:num_results]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    url=item.get("link", ""),
                    snippet=item.get("snippet", ""),
                    source=item.get("source", "Unknown"),
                    published_date=item.get("date", None),
                    thumbnail=item.get("thumbnail", None)
                ))
        elif search_type == "images":
            # Parse image results
            image_results = data.get("images_results", [])
            for item in image_results[:num_results]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    url=item.get("original", item.get("link", "")),
                    snippet=item.get("snippet", ""),
                    source=item.get("source", "Unknown"),
                    thumbnail=item.get("thumbnail", None)
                ))
        else:
            # Parse organic search results
            organic_results = data.get("organic_results", [])
            for item in organic_results[:num_results]:
                results.append(SearchResult(
                    title=item.get("title", ""),
                    url=item.get("link", ""),
                    snippet=item.get("snippet", ""),
                    source=item.get("source", "Google"),
                    published_date=item.get("date", None)
                ))
            
            # Also check for answer box
            answer_box = data.get("answer_box", {})
            if answer_box and not results:
                results.append(SearchResult(
                    title=answer_box.get("title", "Answer"),
                    url=answer_box.get("link", ""),
                    snippet=answer_box.get("snippet", answer_box.get("answer", "")),
                    source="Google Answer Box"
                ))
        
        return SearchResponse(
            results=results,
            query=query,
            total_results=len(results),
            search_time=search_time,
            provider=self.provider_id
        )
