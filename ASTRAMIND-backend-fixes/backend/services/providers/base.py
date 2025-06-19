#backend/app/services/providers/base.py

from abc import ABC, abstractmethod


class BaseProvider(ABC):
    """
    Abstract base class for all external providers.
    """

    name: str

    @abstractmethod
    async def health_check(self) -> bool:
        """
        Return True if provider is healthy.
        """
        raise NotImplementedError
