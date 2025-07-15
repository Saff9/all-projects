"""Web search using DuckDuckGo (no API key required)."""
from __future__ import annotations
import httpx


async def web_search(query: str, max_results: int = 5) -> str:
    """Search the web and return formatted results."""
    try:
        # Use DuckDuckGo HTML search (no API key needed)
        url = "https://html.duckduckgo.com/html/"
        headers = {"User-Agent": "Mozilla/5.0 AgentX/1.0"}
        
        async with httpx.AsyncClient(timeout=15, follow_redirects=True) as client:
            resp = await client.post(url, data={"q": query}, headers=headers)
            resp.raise_for_status()
        
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(resp.text, "lxml")
        results = []
        
        for r in soup.select(".result")[:max_results]:
            title_el = r.select_one(".result__title")
            snippet_el = r.select_one(".result__snippet")
            url_el = r.select_one(".result__url")
            
            title = title_el.get_text(strip=True) if title_el else "No title"
            snippet = snippet_el.get_text(strip=True) if snippet_el else ""
            link = url_el.get_text(strip=True) if url_el else ""
            
            results.append(f"**{title}**\nURL: {link}\n{snippet}")
        
        if not results:
            return f"No results found for: {query}"
        
        return f"Search results for '{query}':\n\n" + "\n\n---\n\n".join(results)
    
    except Exception as exc:
        return f"Web search failed: {exc}"
