# backend/app/providers/huggingface.py

import httpx
from typing import AsyncIterator

from app.providers.base import AIProvider
from core.errors import AppError


class HuggingFaceProvider(AIProvider):
    name = "huggingface"

    def __init__(self, http_client: httpx.AsyncClient | None = None):
        # Optional shared client for connection pooling (recommended in production).
        self._client = http_client

    async def stream(
        self,
        prompt: str,
        model: str,
        api_key: str,
    ) -> AsyncIterator[str]:

        headers = {"Authorization": f"Bearer {api_key}"}
        payload = {"inputs": prompt}

        timeout = httpx.Timeout(30.0, connect=5.0)
        url = f"https://api-inference.huggingface.co/models/{model}"
        try:
            if self._client is None:
                async with httpx.AsyncClient(timeout=timeout, follow_redirects=True) as client:
                    response = await client.post(
                        url,
                        headers=headers,
                        json=payload,
                    )
            else:
                response = await self._client.post(
                    url,
                    headers=headers,
                    json=payload,
                    timeout=timeout,
                )
        except httpx.TimeoutException:
            raise AppError(504, "HuggingFace request timeout - please try again")
        except httpx.NetworkError:
            raise AppError(503, "Network error communicating with HuggingFace")

        if response.status_code != 200:
            raise AppError(502, "HuggingFace provider error")

        yield response.json()[0]["generated_text"]
