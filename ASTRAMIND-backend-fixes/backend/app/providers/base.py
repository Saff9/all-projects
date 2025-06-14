# backend/app/providers/base.py

from abc import ABC, abstractmethod
from typing import AsyncIterator


class AIProvider(ABC):
    """
    Abstract base class for all AI providers.
    Ensures consistent interface.
    """

    name: str

    @abstractmethod
    async def stream(
        self,
        prompt: str,
        model: str,
        api_key: str,
    ) -> AsyncIterator[str]:
        """
        Streams response chunks.
        Must raise ProviderError on failure.
        """
        raise NotImplementedError
