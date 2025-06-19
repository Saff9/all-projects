#backend/app/services/adapters/huggingface.py

import httpx
from services.providers.base import BaseProvider


class HuggingFaceProvider(BaseProvider):
    name = "huggingface"

    async def health_check(self) -> None:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get("https://huggingface.co")
            if r.status_code >= 400:
                raise RuntimeError("HuggingFace unavailable")


async def generate(prompt: str, api_key: str):
    headers = {"Authorization": f"Bearer {api_key}"}
    async with httpx.AsyncClient(timeout=20) as client:
        r = await client.post(
            "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
            headers=headers,
            json={"inputs": prompt},
        )
        return r.json()[0]["generated_text"]
