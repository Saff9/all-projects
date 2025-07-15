"""HTTP request tool – fetch any URL, parse HTML or JSON."""
from __future__ import annotations
import httpx


async def http_request(
    url: str,
    method: str = "GET",
    body: dict | None = None,
    headers: dict | None = None,
) -> str:
    """Make an HTTP request and return the response text (truncated to 4000 chars)."""
    try:
        hdrs = {"User-Agent": "Mozilla/5.0 AgentX/1.0"}
        if headers:
            hdrs.update(headers)

        async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
            if method.upper() == "GET":
                resp = await client.get(url, headers=hdrs)
            else:
                resp = await client.post(url, json=body, headers=hdrs)
            
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "")

            if "json" in content_type:
                import json
                return json.dumps(resp.json(), indent=2)[:4000]
            elif "html" in content_type:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(resp.text, "lxml")
                # Extract readable text
                for tag in soup(["script", "style", "nav", "footer"]):
                    tag.decompose()
                text = soup.get_text(separator="\n", strip=True)
                return text[:4000]
            else:
                return resp.text[:4000]

    except Exception as exc:
        return f"HTTP request failed: {exc}"
