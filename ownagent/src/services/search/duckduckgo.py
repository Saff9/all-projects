"""
DuckDuckGo search provider integration
Provides free web search capabilities using DuckDuckGo
"""
import time
import re
from typing import Optional, Literal, List, Dict, Any
import httpx
from urllib.parse import quote_plus

from src.services.search.base import BaseSearchProvider, SearchResponse, SearchResult


class DuckDuckGoSearchProvider(BaseSearchProvider):
    """DuckDuckGo search provider (free, no API key required)"""
    
    API_BASE_URL = "https://html.duckduckgo.com/html"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        # DuckDuckGo doesn't require an API key
        super().__init__(None, **kwargs)
    
    @property
    def provider_id(self) -> str:
        return "duckduckgo"
    
    @property
    def provider_name(self) -> str:
        return "DuckDuckGo"
    
    def is_available(self) -> bool:
        """DuckDuckGo is always available (no API key needed)"""
        return True
    
    def _parse_html_results(self, html: str) -> List[SearchResult]:
        """Parse HTML search results"""
        results = []
        
        # Simple regex-based parsing (in production, use BeautifulSoup)
        # Find result blocks
        result_pattern = r'<div class="result[^"]*"[^>]*>.*?<h[^>]*class="result__a"[^>]*href="([^"]*)">([^<]*)</[^>]*>.*?<a[^>]*class="result__snippet"[^>]*>(.*?)</a>.*?</div>'
        matches = re.findall(result_pattern, html, re.DOTALL | re.IGNORECASE)
        
        for match in matches:
            url, title, snippet = match
            # Clean up HTML entities
            title = re.sub(r'<[^>]+>', '', title)
            snippet = re.sub(r'<[^>]+>', '', snippet)
            
            # Extract domain as source
            domain_match = re.search(r'https?://(?:www\.)?([^/]+)', url)
            source = domain_match.group(1) if domain_match else "Unknown"
            
            results.append(SearchResult(
                title=title.strip(),
                url=url.strip(),
                snippet=snippet.strip(),
                source=source
            ))
        
        return results
    
    async def search(
        self,
        query: str,
        num_results: int = 10,
        search_type: Literal["general", "news", "images"] = "general",
        **kwargs
    ) -> SearchResponse:
        """
        Perform web search using DuckDuckGo
        
        Args:
            query: Search query
            num_results: Number of results
            search_type: Type of search (only general supported via HTML interface)
            
        Returns:
            SearchResponse with results
        """
        start_time = time.time()
        
        # Build parameters
        params = {
            "q": query,
            "kl": kwargs.get("region", "us-en")  # Region
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                self.API_BASE_URL,
                params=params,
                headers=headers,
                follow_redirects=True
            )
            response.raise_for_status()
            html = response.text
        
        search_time = time.time() - start_time
        
        # Parse results
        results = self._parse_html_results(html)[:num_results]
        
        return SearchResponse(
            results=results,
            query=query,
            total_results=len(results),
            search_time=search_time,
            provider=self.provider_id
        )


class DuckDuckGoLiteProvider(BaseSearchProvider):
    """
    DuckDuckGo Lite provider - uses lite interface for faster results
    """
    
    API_BASE_URL = "https://lite.duckduckgo.com/lite"
    
    def __init__(self, api_key: Optional[str] = None, **kwargs):
        super().__init__(None, **kwargs)
    
    @property
    def provider_id(self) -> str:
        return "duckduckgo_lite"
    
    @property
    def provider_name(self) -> str:
        return "DuckDuckGo Lite"
    
    def is_available(self) -> bool:
        return True
    
    async def search(
        self,
        query: str,
        num_results: int = 10,
        search_type: Literal["general", "news", "images"] = "general",
        **kwargs
    ) -> SearchResponse:
        """Perform search using DuckDuckGo Lite"""
        start_time = time.time()
        
        data = {
            "q": query,
            "kl": kwargs.get("region", "us-en")
        }
        
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                self.API_BASE_URL,
                data=data,
                headers=headers,
                follow_redirects=True
            )
            response.raise_for_status()
            html = response.text
        
        search_time = time.time() - start_time
        
        # Parse results from lite interface
        results = []
        
        # Lite interface has simpler structure
        result_pattern = r'<a[^>]*class="[^"]*result-link[^"]*"[^>]*href="([^"]*)">([^<]*)</a>.*?<td[^>]*class="[^"]*result-snippet[^"]*"[^>]*>(.*?)</td>'
        matches = re.findall(result_pattern, html, re.DOTALL | re.IGNORECASE)
        
        for match in matches[:num_results]:
            url, title, snippet = match
            title = re.sub(r'<[^>]+>', '', title)
            snippet = re.sub(r'<[^>]+>', '', snippet)
            
            domain_match = re.search(r'https?://(?:www\.)?([^/]+)', url)
            source = domain_match.group(1) if domain_match else "Unknown"
            
            results.append(SearchResult(
                title=title.strip(),
                url=url.strip(),
                snippet=snippet.strip(),
                source=source
            ))
        
        return SearchResponse(
            results=results,
            query=query,
            total_results=len(results),
            search_time=search_time,
            provider=self.provider_id
        )
