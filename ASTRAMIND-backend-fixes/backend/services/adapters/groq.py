#backend/app/services/adapters/groq.py

import httpx
from services.providers.base import BaseProvider


class GroqProvider(BaseProvider):
    name = "groq"

    async def health_check(self) -> None:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get("https://api.groq.com")
            if r.status_code >= 400:
                raise RuntimeError("Groq unavailable")


async def generate(prompt: str, api_key: str):
    headers = {"Authorization": f"Bearer {api_key}"}
    data = {
        "model": "llama3-8b-8192",
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers=headers,
            json=data,
        )
        return r.json()["choices"][0]["message"]["content"]
