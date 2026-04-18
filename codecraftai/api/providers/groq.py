import httpx
import logging
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import GROQ_API_KEY

logger = logging.getLogger("codecraft.groq")

GROQ_LOGO = "https://api.iconify.design/simple-icons:groq.svg?color=%2300ff9d"

class GroqProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GROQ_API_KEY
        self.client = httpx.AsyncClient(
            base_url="https://api.groq.com/openai/v1",
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
            logger.warning(f"Groq live model fetch failed: {e}")
            return self._fallback_models()

        results = []
        for m in data:
            mid = m.get("id", "")
            if not mid or "whisper" in mid or "tts" in mid:
                continue
            ctx = m.get("context_window", 8192) or 8192
            results.append(ModelInfo(
                provider="groq",
                model_id=mid,
                display_name=m.get("id", mid).replace("-", " ").title(),
                type="text",
                logo_url=GROQ_LOGO,
                context_length=ctx,
                cost_per_1k_tokens=0.0,
                is_free=True,
                capabilities=["Ultra Fast LPU", "Free Tier"],
                tier="Free Tier / LPU"
            ))
        logger.info(f"Groq: fetched {len(results)} live models")
        return results or self._fallback_models()

    def _fallback_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(provider="groq", model_id="llama-3.3-70b-versatile",
                      display_name="Llama 3.3 70B", type="text", logo_url=GROQ_LOGO,
                      context_length=131072, cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Ultra Fast LPU", "Free Tier"], tier="Free Tier / LPU"),
            ModelInfo(provider="groq", model_id="llama3-8b-8192",
                      display_name="Llama 3 8B", type="text", logo_url=GROQ_LOGO,
                      context_length=8192, cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Fast Inference", "Free Tier"], tier="Free Tier / LPU"),
            ModelInfo(provider="groq", model_id="mixtral-8x7b-32768",
                      display_name="Mixtral 8x7B", type="text", logo_url=GROQ_LOGO,
                      context_length=32768, cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["MoE", "Free Tier"], tier="Free Tier / LPU"),
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
