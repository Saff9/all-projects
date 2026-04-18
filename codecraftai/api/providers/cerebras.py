import httpx
import logging
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import CEREBRAS_API_KEY

logger = logging.getLogger("codecraft.cerebras")

CEREBRAS_LOGO = "https://api.iconify.design/simple-icons:cerebras.svg?color=%23ff6b35"

class CerebrasProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or CEREBRAS_API_KEY
        self.client = httpx.AsyncClient(
            base_url="https://api.cerebras.ai/v1",
            headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
            timeout=20.0
        )

    async def list_models(self) -> List[ModelInfo]:
        if not self.api_key:
            return self._fallback_models()
        try:
            r = await self.client.get("/models")
            r.raise_for_status()
            data = r.json().get("data", [])
        except Exception as e:
            logger.warning(f"Cerebras live model fetch failed: {e}")
            return self._fallback_models()

        results = []
        for m in data:
            mid = m.get("id", "")
            if not mid:
                continue
            ctx = m.get("context_window", 8192) or 8192
            results.append(ModelInfo(
                provider="cerebras",
                model_id=mid,
                display_name=m.get("id", mid).replace("-", " ").title() + " (Cerebras)",
                type="text",
                logo_url=CEREBRAS_LOGO,
                context_length=ctx,
                cost_per_1k_tokens=0.0,
                is_free=True,
                capabilities=["Wafer Scale Speed", "Free Tier"],
                tier="Free Tier / CS-3"
            ))
        logger.info(f"Cerebras: fetched {len(results)} live models")
        return results or self._fallback_models()

    def _fallback_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(provider="cerebras", model_id="llama3.1-8b",
                      display_name="Llama 3.1 8B (Cerebras)", type="text", logo_url=CEREBRAS_LOGO,
                      context_length=8192, cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Wafer Scale Speed", "Free Tier"], tier="Free Tier / CS-3"),
            ModelInfo(provider="cerebras", model_id="llama3.1-70b",
                      display_name="Llama 3.1 70B (Cerebras)", type="text", logo_url=CEREBRAS_LOGO,
                      context_length=8192, cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Wafer Scale Speed", "Free Tier"], tier="Free Tier / CS-3"),
        ]

    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        response = await self.client.post("/chat/completions", json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }, timeout=60.0)
        data = response.json()
        if "error" in data:
            raise Exception(data["error"].get("message", str(data["error"])))
        content = data["choices"][0]["message"]["content"]
        return {"type": "text", "content": content, "usage": data.get("usage", {})}
