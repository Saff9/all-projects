"""
Base search interface for Apex Smart
Defines the contract that all search providers must implement
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime


@dataclass
class SearchResult:
    """Individual search result"""
    title: str
    url: str
    snippet: str
    source: str
    published_date: Optional[str] = None
    thumbnail: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "title": self.title,
            "url": self.url,
            "snippet": self.snippet,
            "source": self.source,
            "published_date": self.published_date,
            "thumbnail": self.thumbnail
        }


@dataclass
class SearchResponse:
    """Search response with results and metadata"""
    results: List[SearchResult]
    query: str
    total_results: int
    search_time: float
    provider: str
    cached: bool = False
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            "results": [r.to_dict() for r in self.results],
            "query": self.query,
            "total_results": self.total_results,
            "search_time": self.search_time,
            "provider": self.provider,
            "cached": self.cached
        }


class BaseSearchProvider(ABC):
    """Base class for search providers"""
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        self.api_key = api_key
        self.config = kwargs
    
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
    
    @abstractmethod
    async def search(
        self,
        query: str,
        num_results: int = 10,
        search_type: Literal["general", "news", "images"] = "general",
        **kwargs
    ) -> SearchResponse:
        """
        Perform web search
        
        Args:
            query: Search query string
            num_results: Number of results to return
            search_type: Type of search (general, news, images)
            **kwargs: Additional provider-specific options
            
        Returns:
            SearchResponse with results
        """
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider is properly configured and available"""
        pass
    
    def format_for_context(self, response: SearchResponse, max_results: int = 5) -> str:
        """
        Format search results for inclusion in AI context
        
        Args:
            response: Search response
            max_results: Maximum number of results to include
            
        Returns:
            Formatted string for context
        """
        lines = [
            f"Web search results for: {response.query}",
            f"Provider: {response.provider}",
            "---"
        ]
        
        for i, result in enumerate(response.results[:max_results], 1):
            lines.append(f"{i}. {result.title}")
            lines.append(f"   Source: {result.source}")
            lines.append(f"   URL: {result.url}")
            lines.append(f"   {result.snippet}")
            if result.published_date:
                lines.append(f"   Published: {result.published_date}")
            lines.append("")
        
        return "\n".join(lines)
