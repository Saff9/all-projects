import httpx
import logging
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import OPENROUTER_API_KEY

logger = logging.getLogger("codecraft.openrouter")

def get_openrouter_logo(model_id: str) -> str:
    mid_lower = model_id.lower()
    parts = mid_lower.split("/")
    brand = parts[0] if len(parts) > 1 else ""
    
    if "google" in brand or "gemini" in mid_lower:
        return "https://api.iconify.design/logos:google-gemini.svg"
    elif "meta" in brand or "llama" in mid_lower:
        return "https://api.iconify.design/simple-icons:meta.svg?color=%230467DF"
    elif "mistral" in brand:
        return "https://api.iconify.design/simple-icons:mistral.svg?color=%23FD5E30"
    elif "deepseek" in brand:
        return "https://api.iconify.design/arcticons:deepseek.svg?color=%230066ff"
    elif "qwen" in brand or "alibaba" in brand:
        return "https://api.iconify.design/simple-icons:alibaba.svg?color=%23FF6A00"
    elif "openai" in brand or "gpt" in mid_lower:
        return "https://api.iconify.design/simple-icons:openai.svg?color=%23412991"
    elif "anthropic" in brand or "claude" in mid_lower:
        return "https://api.iconify.design/simple-icons:anthropic.svg?color=%23CC9C80"
    elif "cohere" in brand:
        return "https://api.iconify.design/simple-icons:cohere.svg?color=%233F6E5E"
    elif "microsoft" in brand or "phi" in mid_lower:
        return "https://api.iconify.design/simple-icons:microsoft.svg?color=%2300A4EF"
    
    return "https://api.iconify.design/simple-icons:openrouter.svg?color=%23306EE8"

class OpenRouterProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or OPENROUTER_API_KEY
        headers = {
            "HTTP-Referer": "https://codecraft.ai",
            "X-Title": "Code Craft"
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        self.client = httpx.AsyncClient(
            base_url="https://openrouter.ai/api/v1",
            headers=headers,
            timeout=30.0
        )

    async def list_models(self) -> List[ModelInfo]:
        """Fetch live model list directly from OpenRouter /models endpoint."""
        try:
            response = await self.client.get("/models")
            response.raise_for_status()
            data = response.json()
            models_raw = data.get("data", [])
        except Exception as e:
            logger.warning(f"OpenRouter live model fetch failed: {e}. Using fallback list.")
            return self._fallback_models()

        results: List[ModelInfo] = []
        for m in models_raw:
            mid = m.get("id", "")
            if not mid:
                continue

            name = m.get("name", mid)
            ctx = m.get("context_length", 8192) or 8192

            # Detect pricing
            pricing = m.get("pricing", {})
            prompt_cost_str = pricing.get("prompt", "0")
            try:
                cost_per_token = float(prompt_cost_str)
            except (ValueError, TypeError):
                cost_per_token = 0.0
            cost_per_1k = round(cost_per_token * 1000, 6)
            is_free = (":free" in mid) or (cost_per_token == 0.0)

            # Detect modality
            arch = m.get("architecture", {})
            input_mods = arch.get("input_modalities", []) or arch.get("modality", "") or []
            supports_image = "image" in input_mods if isinstance(input_mods, list) else "image" in str(input_mods)
            model_type = "text"

            # Capabilities
            caps = []
            if supports_image:
                caps.append("Vision")
            if ctx >= 100000:
                caps.append("Long Context")
            if is_free:
                caps.append("Free Tier")
            if "coder" in mid.lower() or "code" in mid.lower():
                caps.append("Code")
            if "reason" in mid.lower() or ":thinking" in mid.lower() or "r1" in mid.lower():
                caps.append("Reasoning")

            tier = "Free Tier" if is_free else "Paid"

            results.append(ModelInfo(
                provider="openrouter",
                model_id=mid,
                display_name=name,
                type=model_type,
                description=m.get("description", f"OpenRouter: {name}"),
                logo_url=get_openrouter_logo(mid),
                context_length=ctx,
                cost_per_1k_tokens=cost_per_1k,
                is_free=is_free,
                capabilities=caps,
                tier=tier
            ))

        logger.info(f"OpenRouter: fetched {len(results)} live models")
        return results

    def _fallback_models(self) -> List[ModelInfo]:
        """Minimal hardcoded fallback if the API is unreachable."""
        return [
            ModelInfo(provider="openrouter", model_id="deepseek/deepseek-r1:free",
                      display_name="DeepSeek R1 (Free)", type="text",
                      logo_url=get_openrouter_logo("deepseek/deepseek-r1:free"), context_length=65536,
                      cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Reasoning", "Free Tier"], tier="Free Tier"),
            ModelInfo(provider="openrouter", model_id="qwen/qwen-2.5-72b-instruct:free",
                      display_name="Qwen 2.5 72B (Free)", type="text",
                      logo_url=get_openrouter_logo("qwen/qwen-2.5-72b-instruct:free"), context_length=32768,
                      cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["Multilingual", "Free Tier"], tier="Free Tier"),
            ModelInfo(provider="openrouter", model_id="meta-llama/llama-3.3-70b-instruct:free",
                      display_name="Llama 3.3 70B (Free)", type="text",
                      logo_url=get_openrouter_logo("meta-llama/llama-3.3-70b-instruct:free"), context_length=131072,
                      cost_per_1k_tokens=0.0, is_free=True,
                      capabilities=["General AI", "Free Tier"], tier="Free Tier"),
            ModelInfo(provider="openrouter", model_id="anthropic/claude-3.5-sonnet",
                      display_name="Claude 3.5 Sonnet", type="text",
                      logo_url=get_openrouter_logo("anthropic/claude-3.5-sonnet"), context_length=200000,
                      cost_per_1k_tokens=0.003, is_free=False,
                      capabilities=["Vision", "Long Context"], tier="Paid"),
            ModelInfo(provider="openrouter", model_id="openai/gpt-4o",
                      display_name="GPT-4o", type="text",
                      logo_url=get_openrouter_logo("openai/gpt-4o"), context_length=128000,
                      cost_per_1k_tokens=0.0025, is_free=False,
                      capabilities=["Vision", "Long Context"], tier="Paid"),
        ]

    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        messages = []
        if image_base64:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_base64}}
                ]
            })
        else:
            messages.append({"role": "user", "content": prompt})

        response = await self.client.post("/chat/completions", json={
            "model": model,
            "messages": messages
        }, timeout=90.0)
        data = response.json()
        if "error" in data:
            err = data["error"]
            msg = err.get("message", str(err)) if isinstance(err, dict) else str(err)
            raise Exception(msg)
        content = data["choices"][0]["message"]["content"]
        return {"type": "text", "content": content, "usage": data.get("usage", {})}
