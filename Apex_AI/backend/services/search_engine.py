# backend/services/search_engine.py

import httpx
import json
from config import settings

from services.model_driver import call_groq   # <--- FIXED! SAFE IMPORT


SEARCH_API_URL = "https://google.serper.dev/search"


async def web_search(query: str):
    headers = {
        "X-API-KEY": settings.SEARCH_API_KEY,
        "Content-Type": "application/json",
    }

    body = {"q": query}

    async with httpx.AsyncClient() as client:
        res = await client.post(SEARCH_API_URL, headers=headers, json=body)
        data = res.json()

    results = []

    if "organic" in data:
        for item in data["organic"][:5]:
            results.append({
                "title": item.get("title", ""),
                "snippet": item.get("snippet", ""),
                "link": item.get("link", ""),
            })

    return results


def format_citations(results):
    md = ""
    for i, r in enumerate(results, start=1):
        md += f"[{i}] {r['title']} — {r['link']}\n"
    return md


async def synthesize_answer(query: str, results):
    context = "\n\n".join(
        f"Title: {r['title']}\nSnippet: {r['snippet']}\nURL: {r['link']}"
        for r in results
    )

    prompt = f"""
You are Apex AI's research engine.

Use ONLY the provided search results to answer the user query.
If something is not supported by the search data, say "Not enough information".

User Query:
{query}

Search Data:
{context}

Write the final answer in clean Markdown.
Include citations using this format: [1], [2], [3]...

Now write the answer:
"""

    response = await call_groq("llama3-70b-8192", prompt)
    return response


async def run_search_query(query: str):
    results = await web_search(query)

    if not results:
        return "No search results found."

    answer = await synthesize_answer(query, results)
    citations = format_citations(results)

    final_output = (
        f"{answer}\n\n"
        "---\n"
        "### Sources\n"
        f"{citations}"
    )

    return final_output
