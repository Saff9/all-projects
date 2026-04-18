import httpx
import base64
from typing import List, Optional
from api.providers.base import BaseProvider
from api.models_cache import ModelInfo
from api.config import HUGGINGFACE_API_KEY

class HuggingFaceProvider(BaseProvider):
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or HUGGINGFACE_API_KEY
        self.client = httpx.AsyncClient(base_url="https://api-inference.huggingface.co/models",
                                        headers={"Authorization": f"Bearer {key}"} if key else {})

    async def list_models(self) -> List[ModelInfo]:
        return [
            ModelInfo(provider="huggingface", model_id="black-forest-labs/FLUX.1-schnell", display_name="FLUX.1 Schnell (Image)",
                      type="image", logo_url="/logos/huggingface.svg", context_length=1024, cost_per_1k_tokens=0.005),
            ModelInfo(provider="huggingface", model_id="meta-llama/Meta-Llama-3-8B-Instruct", display_name="Llama 3 8B (HF)",
                      type="text", logo_url="/logos/huggingface.svg", context_length=8192, cost_per_1k_tokens=0.0005),
        ]

    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        if generation_type == "image":
            response = await self.client.post(f"/{model}", json={"inputs": prompt}, timeout=60.0)
            if response.status_code != 200:
                try:
                    err = response.json()
                    raise Exception(err.get("error", str(err)))
                except Exception:
                    raise Exception(f"HF Image generation failed: {response.status_code}")
            
            b64_img = base64.b64encode(response.content).decode("utf-8")
            return {"type": "image", "content": f"data:image/png;base64,{b64_img}", "usage": {"prompt_tokens": 10, "completion_tokens": 10}}
        else:
            response = await self.client.post(f"/{model}", json={"inputs": prompt, "parameters": {"max_new_tokens": 1024}}, timeout=60.0)
            data = response.json()
            if isinstance(data, dict) and "error" in data:
                raise Exception(data["error"])
            content = data[0].get("generated_text", "")
            if content.startswith(prompt):
                content = content[len(prompt):].strip()
            return {"type": "text", "content": content, "usage": {"prompt_tokens": len(prompt)//4, "completion_tokens": len(content)//4}}
