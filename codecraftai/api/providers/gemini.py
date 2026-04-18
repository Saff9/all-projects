import httpx
import logging
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import GEMINI_API_KEY

logger = logging.getLogger("codecraft.gemini")

GEMINI_LOGO = "https://api.iconify.design/simple-icons:googlegemini.svg?color=%234285f4"

# Models we want to expose (Gemini's /models endpoint returns many internal ones)
GEMINI_ALLOWED_PREFIXES = ("gemini-1.5", "gemini-2", "gemini-pro", "gemini-flash")

class GeminiProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GEMINI_API_KEY
        self.client = httpx.AsyncClient(
            base_url="https://generativelanguage.googleapis.com/v1beta",
            timeout=20.0
        )

    async def list_models(self) -> List[ModelInfo]:
        if not self.api_key:
            return self._fallback_models()
        try:
            r = await self.client.get(f"/models?key={self.api_key}")
            r.raise_for_status()
            raw = r.json().get("models", [])
        except Exception as e:
            logger.warning(f"Gemini live model fetch failed: {e}")
            return self._fallback_models()

        results = []
        for m in raw:
            # name like "models/gemini-1.5-flash-latest"
            full_name = m.get("name", "")
            mid = full_name.replace("models/", "")
            if not mid:
                continue
            # Filter to only generation models
            supported = m.get("supportedGenerationMethods", [])
            if "generateContent" not in supported:
                continue
            # Only expose useful models
            if not any(mid.startswith(p) for p in GEMINI_ALLOWED_PREFIXES):
                continue

            display = m.get("displayName", mid)
            ctx = m.get("inputTokenLimit", 1048576) or 1048576

            # Detect vision capability
            caps = ["Multimodal Vision", "Long Context"]
            is_flash = "flash" in mid
            cost = 0.0 if is_flash else 0.00125

            results.append(ModelInfo(
                provider="gemini",
                model_id=mid,
                display_name=display,
                type="text",
                logo_url=GEMINI_LOGO,
                context_length=ctx,
                cost_per_1k_tokens=cost,
                is_free=is_flash,
                capabilities=caps,
                tier="Free Tier" if is_flash else "Professional"
            ))

        logger.info(f"Gemini: fetched {len(results)} live models")
        return results or self._fallback_models()

    def _fallback_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(provider="gemini", model_id="gemini-1.5-flash-latest",
                      display_name="Gemini 1.5 Flash", type="text", logo_url=GEMINI_LOGO,
                      context_length=1048576, cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Multimodal Vision", "Long Context"], tier="Free Tier"),
            ModelInfo(provider="gemini", model_id="gemini-1.5-pro-latest",
                      display_name="Gemini 1.5 Pro", type="text", logo_url=GEMINI_LOGO,
                      context_length=2097152, cost_per_1k_tokens=0.00125, is_free=False,
                      capabilities=["Multimodal Vision", "Long Context"], tier="Professional"),
        ]

    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        if not self.api_key:
            raise Exception("Gemini API key is missing")

        contents = []
        if image_base64:
            b64_data = image_base64.split(",")[-1] if "," in image_base64 else image_base64
            contents.append({"parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": "image/jpeg", "data": b64_data}}
            ]})
        else:
            contents.append({"parts": [{"text": prompt}]})

        url = f"/models/{model}:generateContent?key={self.api_key}"
        response = await self.client.post(url, json={"contents": contents}, timeout=60.0)
        data = response.json()
        if "error" in data:
            raise Exception(data["error"].get("message", str(data["error"])))

        try:
            content = data["candidates"][0]["content"]["parts"][0]["text"]
            usage = {
                "prompt_tokens": data.get("usageMetadata", {}).get("promptTokenCount", len(prompt) // 4),
                "completion_tokens": data.get("usageMetadata", {}).get("candidatesTokenCount", len(content) // 4)
            }
            return {"type": "text", "content": content, "usage": usage}
        except Exception:
            raise Exception(f"Failed to parse Gemini response: {str(data)}")
