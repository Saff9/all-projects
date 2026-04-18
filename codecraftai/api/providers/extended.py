import httpx
from typing import Optional, List, Dict, Any
import logging
from api.models_cache import ModelInfo

logger = logging.getLogger("codecraft.providers.extended")

PROVIDER_CONFIGS = {
    "xai": {"endpoint": "https://api.x.ai/v1", "name": "xAI Grok", "logo": "/logos/xai.svg"},
    "together": {"endpoint": "https://api.together.xyz/v1", "name": "Together AI", "logo": "/logos/together.svg"},
    "mistral": {"endpoint": "https://api.mistral.ai/v1", "name": "Mistral AI", "logo": "/logos/mistral.svg"},
    "anthropic": {"endpoint": "https://api.anthropic.com/v1", "name": "Anthropic Claude", "logo": "/logos/anthropic.svg"},
    "openai": {"endpoint": "https://api.openai.com/v1", "name": "OpenAI", "logo": "/logos/openai.svg"},
    "perplexity": {"endpoint": "https://api.perplexity.ai", "name": "Perplexity AI", "logo": "/logos/perplexity.svg"},
    "cohere": {"endpoint": "https://api.cohere.ai/v1", "name": "Cohere", "logo": "/logos/cohere.svg"},
    "fireworks": {"endpoint": "https://api.fireworks.ai/inference/v1", "name": "Fireworks AI", "logo": "/logos/fireworks.svg"},
    "sambanova": {"endpoint": "https://api.sambanova.ai/v1", "name": "Sambanova", "logo": "/logos/sambanova.svg"},
    "siliconflow": {"endpoint": "https://api.siliconflow.cn/v1", "name": "SiliconFlow", "logo": "/logos/siliconflow.svg"},
    "zhipu": {"endpoint": "https://open.bigmodel.cn/api/paas/v4", "name": "Zhipu AI (GLM)", "logo": "/logos/zhipu.svg"},
    "moonshot": {"endpoint": "https://api.moonshot.cn/v1", "name": "Moonshot AI (Kimi)", "logo": "/logos/moonshot.svg"},
}

class ExtendedCompatibleProvider:
    """Generic OpenAI-Compatible Provider Adapter for Extended Ecosystem"""
    def __init__(self, provider_id: str, api_key: str):
        self.provider_id = provider_id
        self.api_key = api_key
        self.config = PROVIDER_CONFIGS.get(provider_id, {"endpoint": "", "name": provider_id.upper(), "logo": "/logos/custom.svg"})
        self.endpoint = self.config["endpoint"]
        self.client = httpx.AsyncClient(headers={
            "Authorization": f"Bearer {api_key}" if api_key else "",
            "Content-Type": "application/json"
        })

    async def list_models(self) -> List[ModelInfo]:
        url = f"{self.endpoint}/models"
        models = []
        try:
            if self.api_key and self.endpoint:
                response = await self.client.get(url, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    for m in data.get("data", []):
                        mid = m.get("id", "")
                        models.append(ModelInfo(
                            provider=self.provider_id,
                            model_id=mid,
                            display_name=f"{self.config['name']} {mid.split('/')[-1]}",
                            type="text" if "vision" not in mid.lower() else "image",
                            logo_url=self.config["logo"],
                            context_length=32768,
                            cost_per_1k_tokens=0.01,
                            is_free=False,
                            capabilities=["Tool Use"] if "instruct" in mid.lower() or "chat" in mid.lower() else [],
                            tier="Professional"
                        ))
        except Exception as e:
            logger.warning(f"Failed to fetch live models for {self.provider_id}: {str(e)}")

        # Fallback pre-cached models if live fetch fails or no key
        if not models:
            models = self.get_fallback_models()
        return models

    def get_fallback_models(self) -> List[ModelInfo]:
        pid = self.provider_id
        cname = self.config["name"]
        logo = self.config["logo"]
        
        fallbacks = {
            "xai": [
                ModelInfo(provider=pid, model_id="grok-2-latest", display_name="Grok 2 (Latest)", type="text", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.01, is_free=False, capabilities=["Web Search", "Tool Use"], tier="Flagship"),
                ModelInfo(provider=pid, model_id="grok-2-vision-latest", display_name="Grok 2 Vision", type="image", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.01, is_free=False, capabilities=["Multimodal Vision", "Web Search"], tier="Multimodal Flagship")
            ],
            "together": [
                ModelInfo(provider=pid, model_id="meta-llama/Llama-3.3-70B-Instruct-Turbo", display_name="Llama 3.3 70B Turbo", type="text", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.003, is_free=False, capabilities=["Senior Code Agent", "Tool Use"], tier="Enterprise Flagship"),
                ModelInfo(provider=pid, model_id="mistralai/Mixtral-8x22B-Instruct-v0.1", display_name="Mixtral 8x22B", type="text", logo_url=logo, context_length=65536, cost_per_1k_tokens=0.005, is_free=False, capabilities=["Tool Use"], tier="Professional")
            ],
            "mistral": [
                ModelInfo(provider=pid, model_id="mistral-large-latest", display_name="Mistral Large 2", type="text", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.008, is_free=False, capabilities=["Function Calling", "Tool Use"], tier="Flagship"),
                ModelInfo(provider=pid, model_id="pixtral-large-latest", display_name="Pixtral Large (Vision)", type="image", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.008, is_free=False, capabilities=["Multimodal Vision"], tier="Multimodal Flagship")
            ],
            "anthropic": [
                ModelInfo(provider=pid, model_id="claude-3-5-sonnet-20241022", display_name="Claude 3.5 Sonnet (Latest)", type="text", logo_url=logo, context_length=200000, cost_per_1k_tokens=0.015, is_free=False, capabilities=["Senior Code Agent", "Computer Use", "Tool Use"], tier="Enterprise Flagship"),
                ModelInfo(provider=pid, model_id="claude-3-5-haiku-20241022", display_name="Claude 3.5 Haiku", type="text", logo_url=logo, context_length=200000, cost_per_1k_tokens=0.003, is_free=False, capabilities=["Speed / Economy", "Tool Use"], tier="Speed / Economy")
            ],
            "openai": [
                ModelInfo(provider=pid, model_id="gpt-4o", display_name="GPT-4o (Omni)", type="image", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.01, is_free=False, capabilities=["Multimodal Vision", "Function Calling", "Web Search"], tier="Flagship"),
                ModelInfo(provider=pid, model_id="gpt-4o-mini", display_name="GPT-4o mini", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.0015, is_free=False, capabilities=["Speed / Economy", "Function Calling"], tier="Speed / Economy"),
                ModelInfo(provider=pid, model_id="o1-preview", display_name="o1 Preview (Reasoning)", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.06, is_free=False, capabilities=["Advanced Reasoning", "Math/Code"], tier="Expert Reasoning")
            ],
            "perplexity": [
                ModelInfo(provider=pid, model_id="sonar-reasoning-pro", display_name="Sonar Reasoning Pro", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.02, is_free=False, capabilities=["Web Search", "Advanced Reasoning"], tier="Flagship Search"),
                ModelInfo(provider=pid, model_id="sonar-pro", display_name="Sonar Pro", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.01, is_free=False, capabilities=["Web Search"], tier="Professional Search")
            ],
            "cohere": [
                ModelInfo(provider=pid, model_id="command-r-plus-08-2024", display_name="Command R+ (Latest)", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.01, is_free=False, capabilities=["Tool Use", "Multilingual"], tier="Enterprise Flagship")
            ],
            "fireworks": [
                ModelInfo(provider=pid, model_id="accounts/fireworks/models/llama-v3p3-70b-instruct", display_name="Fireworks Llama 3.3 70B", type="text", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.003, is_free=False, capabilities=["Tool Use", "Fast Inference"], tier="Flagship")
            ],
            "sambanova": [
                ModelInfo(provider=pid, model_id="Meta-Llama-3.3-70B-Instruct", display_name="SambaNova Llama 3.3 70B", type="text", logo_url=logo, context_length=131072, cost_per_1k_tokens=0.002, is_free=False, capabilities=["Ultra Fast Inference"], tier="Flagship")
            ],
            "siliconflow": [
                ModelInfo(provider=pid, model_id="deepseek-ai/DeepSeek-R1", display_name="SiliconFlow DeepSeek R1", type="text", logo_url=logo, context_length=65536, cost_per_1k_tokens=0.004, is_free=False, capabilities=["Advanced Reasoning"], tier="Expert Reasoning")
            ],
            "zhipu": [
                ModelInfo(provider=pid, model_id="glm-4-plus", display_name="GLM-4 Plus", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.01, is_free=False, capabilities=["Tool Use", "Web Search"], tier="Flagship")
            ],
            "moonshot": [
                ModelInfo(provider=pid, model_id="moonshot-v1-128k", display_name="Kimi Moonshot 128K", type="text", logo_url=logo, context_length=128000, cost_per_1k_tokens=0.012, is_free=False, capabilities=["Long Context", "File Analysis"], tier="Flagship")
            ]
        }
        
        return fallbacks.get(pid, [
            ModelInfo(provider=pid, model_id=f"{pid}-general", display_name=f"{cname} General Model", type="text", logo_url=logo, context_length=32768, cost_per_1k_tokens=0.01, is_free=False, capabilities=["General AI"], tier="Professional")
        ])

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
            logger.error(f"{self.config['name']} error: {str(e)}")
            raise Exception(f"{self.config['name']} Error: {str(e)}")
