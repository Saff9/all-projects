import httpx
from typing import Optional, List, Dict, Any
import logging
from api.models_cache import ModelInfo

logger = logging.getLogger("codecraft.providers.alibaba")

class AlibabaProvider:
    """Alibaba Cloud DashScope Provider (Qwen Ecosystem)"""
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://dashscope.aliyuncs.com/compatible-mode/v1"
        self.client = httpx.AsyncClient(headers={
            "Authorization": f"Bearer {api_key}" if api_key else "",
            "Content-Type": "application/json"
        })

    async def list_models(self) -> List[ModelInfo]:
        # Return pre-cached Alibaba Qwen ecosystem models
        return [
            ModelInfo(
                provider="alibaba",
                model_id="qwen-max",
                display_name="Qwen Max (Flagship)",
                type="text",
                logo_url="/logos/qwen.svg",
                context_length=32768,
                cost_per_1k_tokens=0.02,
                is_free=False,
                capabilities=["Tool Use", "Function Calling", "Web Search"],
                tier="Enterprise Flagship"
            ),
            ModelInfo(
                provider="alibaba",
                model_id="qwen-plus",
                display_name="Qwen Plus (Balanced)",
                type="text",
                logo_url="/logos/qwen.svg",
                context_length=131072,
                cost_per_1k_tokens=0.004,
                is_free=False,
                capabilities=["Tool Use", "Function Calling"],
                tier="Professional"
            ),
            ModelInfo(
                provider="alibaba",
                model_id="qwen-turbo",
                display_name="Qwen Turbo (Fast)",
                type="text",
                logo_url="/logos/qwen.svg",
                context_length=131072,
                cost_per_1k_tokens=0.001,
                is_free=False,
                capabilities=["Tool Use"],
                tier="Speed / Economy"
            ),
            ModelInfo(
                provider="alibaba",
                model_id="qwen-2.5-coder-32b-instruct",
                display_name="Qwen 2.5 Coder 32B",
                type="text",
                logo_url="/logos/qwen.svg",
                context_length=131072,
                cost_per_1k_tokens=0.002,
                is_free=False,
                capabilities=["Senior Code Agent", "Tool Use"],
                tier="Developer Specialized"
            ),
            ModelInfo(
                provider="alibaba",
                model_id="qwen-vl-max-latest",
                display_name="Qwen VL Max (Vision)",
                type="image",
                logo_url="/logos/qwen.svg",
                context_length=32768,
                cost_per_1k_tokens=0.02,
                is_free=False,
                capabilities=["Multimodal Vision", "OCR"],
                tier="Multimodal Flagship"
            ),
        ]

    async def generate(self, model: str, prompt: str, image_base64: Optional[str] = None, generation_type: str = "text") -> dict:
        url = f"{self.endpoint}/chat/completions"
        messages = []

        if image_base64 and generation_type in ["image", "text"]:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": image_base64}}
                ]
            })
        else:
            messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }

        try:
            response = await self.client.post(url, json=payload, timeout=60.0)
            data = response.json()
            if "error" in data:
                raise Exception(data["error"].get("message", str(data["error"])))
            
            content = data["choices"][0]["message"]["content"]
            usage = data.get("usage", {})
            return {
                "type": "text",
                "content": content,
                "usage": usage
            }
        except Exception as e:
            logger.error(f"Alibaba DashScope error: {str(e)}")
            raise Exception(f"Alibaba DashScope Error: {str(e)}")
