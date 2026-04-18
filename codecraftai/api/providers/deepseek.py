import httpx
import logging
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import DEEPSEEK_API_KEY

logger = logging.getLogger("codecraft.deepseek")

DEEPSEEK_LOGO = "https://api.iconify.design/arcticons:deepseek.svg?color=%230066ff"

class DeepSeekProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or DEEPSEEK_API_KEY
        self.client = httpx.AsyncClient(
            base_url="https://api.deepseek.com/v1",
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
            logger.warning(f"DeepSeek live model fetch failed: {e}")
            return self._fallback_models()

        results = []
        for m in data:
            mid = m.get("id", "")
            if not mid:
                continue
            is_reasoner = "reasoner" in mid or "r1" in mid
            cost = 0.002 if is_reasoner else 0.00014
            caps = ["Advanced Reasoning", "Math/Code"] if is_reasoner else ["General AI", "Fast Inference"]
            results.append(ModelInfo(
                provider="deepseek",
                model_id=mid,
                display_name=m.get("id", mid).replace("deepseek-", "DeepSeek ").title(),
                type="text",
                logo_url=DEEPSEEK_LOGO,
                context_length=m.get("context_window", 65536) or 65536,
                cost_per_1k_tokens=cost,
                is_free=False,
                capabilities=caps,
                tier="Expert Reasoning" if is_reasoner else "Professional"
            ))
        logger.info(f"DeepSeek: fetched {len(results)} live models")
        return results or self._fallback_models()

    def _fallback_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(provider="deepseek", model_id="deepseek-chat",
                      display_name="DeepSeek V3 (Chat)", type="text", logo_url=DEEPSEEK_LOGO,
                      context_length=65536, cost_per_1k_tokens=0.00014, is_free=False,
                      capabilities=["General AI", "Fast Inference"], tier="Professional"),
            ModelInfo(provider="deepseek", model_id="deepseek-reasoner",
                      display_name="DeepSeek R1 (Reasoner)", type="text", logo_url=DEEPSEEK_LOGO,
                      context_length=65536, cost_per_1k_tokens=0.002, is_free=False,
                      capabilities=["Advanced Reasoning", "Math/Code"], tier="Expert Reasoning"),
        ]

    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        response = await self.client.post("/chat/completions", json={
            "model": model,
            "messages": [{"role": "user", "content": prompt}]
        }, timeout=90.0)
        data = response.json()
        if "error" in data:
            raise Exception(data["error"].get("message", str(data["error"])))
        content = data["choices"][0]["message"]["content"]
        return {"type": "text", "content": content, "usage": data.get("usage", {})}
