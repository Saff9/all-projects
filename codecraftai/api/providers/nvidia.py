import httpx
import logging
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import NVIDIA_API_KEY

logger = logging.getLogger("codecraft.nvidia")

NVIDIA_LOGO = "https://api.iconify.design/simple-icons:nvidia.svg?color=%2376b900"

class NvidiaProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or NVIDIA_API_KEY
        self.client = httpx.AsyncClient(
            base_url="https://integrate.api.nvidia.com/v1",
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
            logger.warning(f"NVIDIA live model fetch failed: {e}")
            return self._fallback_models()

        results = []
        for m in data:
            mid = m.get("id", "")
            if not mid:
                continue
            ctx = m.get("context_window", 128000) or 128000
            caps = []
            if "vision" in mid.lower() or "neva" in mid.lower() or "vlm" in mid.lower():
                caps.append("Vision")
            if "coder" in mid.lower() or "code" in mid.lower():
                caps.append("Code")
            if "embed" in mid.lower():
                continue  # skip embedding models
            caps.append("NVIDIA NIM")
            results.append(ModelInfo(
                provider="nvidia",
                model_id=mid,
                display_name=mid.split("/")[-1].replace("-", " ").title(),
                type="text",
                logo_url=NVIDIA_LOGO,
                context_length=ctx,
                cost_per_1k_tokens=0.001,
                is_free=False,
                capabilities=caps,
                tier="Enterprise NIM"
            ))
        logger.info(f"NVIDIA: fetched {len(results)} live models")
        return results or self._fallback_models()

    def _fallback_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(provider="nvidia", model_id="meta/llama-3.1-70b-instruct",
                      display_name="Llama 3.1 70B (NVIDIA)", type="text", logo_url=NVIDIA_LOGO,
                      context_length=128000, cost_per_1k_tokens=0.0008, is_free=False,
                      capabilities=["NVIDIA NIM"], tier="Enterprise NIM"),
            ModelInfo(provider="nvidia", model_id="meta/llama-3.1-405b-instruct",
                      display_name="Llama 3.1 405B (NVIDIA)", type="text", logo_url=NVIDIA_LOGO,
                      context_length=128000, cost_per_1k_tokens=0.005, is_free=False,
                      capabilities=["Flagship 405B", "NVIDIA NIM"], tier="Enterprise Flagship"),
        ]

    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        messages = []
        if image_base64:
            messages.append({"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": image_base64}}
            ]})
        else:
            messages.append({"role": "user", "content": prompt})

        response = await self.client.post("/chat/completions", json={
            "model": model, "messages": messages, "max_tokens": 1024
        }, timeout=90.0)
        data = response.json()
        if "error" in data:
            raise Exception(data["error"].get("message", str(data["error"])))
        content = data["choices"][0]["message"]["content"]
        return {"type": "text", "content": content, "usage": data.get("usage", {})}
