from abc import ABC, abstractmethod
from typing import List, Optional
from api.models_cache import ModelInfo

class BaseProvider(ABC):
    @abstractmethod
    async def list_models(self) -> List[ModelInfo]:
        pass

    @abstractmethod
    async def generate(self, model: str, prompt: str,
                       image_base64: Optional[str] = None,
                       generation_type: str = "text") -> dict:
        # returns {"type": "text"|"image"|"video", "content": str, "usage": dict}
        pass
