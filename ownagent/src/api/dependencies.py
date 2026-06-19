"""
FastAPI dependencies
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.core.database import get_db as get_db_session
from src.models.database import ProviderConfig
from src.services.ai import get_provider_class, BaseAIProvider
from src.core.exceptions import ProviderNotConfiguredError


def get_db() -> Generator[Session, None, None]:
    """Get database session dependency"""
    yield from get_db_session()


async def get_provider(
    provider_id: str,
    db: Session = Depends(get_db)
) -> BaseAIProvider:
    """
    Get configured AI provider instance
    
    Args:
        provider_id: Provider identifier
        db: Database session
        
    Returns:
        Configured provider instance
        
    Raises:
        HTTPException: If provider not found or not configured
    """
    # Get provider class
    provider_class = get_provider_class(provider_id)
    if not provider_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown provider: {provider_id}"
        )
    
    # Get provider config from database
    config = db.query(ProviderConfig).filter(
        ProviderConfig.provider_id == provider_id
    ).first()
    
    if not config:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider '{provider_id}' not configured"
        )
    
    api_key = config.get_api_key()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider '{provider_id}' API key not set"
        )
    
    # Create provider instance
    return provider_class(api_key=api_key, base_url=config.base_url)


class ProviderManager:
    """Manager for AI providers"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_provider_instance(self, provider_id: str) -> BaseAIProvider:
        """Get provider instance by ID"""
        provider_class = get_provider_class(provider_id)
        if not provider_class:
            raise ProviderNotConfiguredError(provider_id)
        
        config = self.db.query(ProviderConfig).filter(
            ProviderConfig.provider_id == provider_id
        ).first()
        
        if not config:
            raise ProviderNotConfiguredError(provider_id)
        
        api_key = config.get_api_key()
        if not api_key:
            raise ProviderNotConfiguredError(provider_id)
        
        return provider_class(api_key=api_key, base_url=config.base_url)
    
    def get_all_providers_status(self) -> list:
        """Get status of all providers"""
        from src.services.ai import get_all_provider_ids
        
        providers = []
        for provider_id in get_all_provider_ids():
            provider_class = get_provider_class(provider_id)
            if provider_class:
                # Create temporary instance to get metadata
                temp_instance = provider_class.__new__(provider_class)
                
                config = self.db.query(ProviderConfig).filter(
                    ProviderConfig.provider_id == provider_id
                ).first()
                
                is_configured = config is not None and config.get_api_key() is not None
                
                providers.append({
                    "id": provider_id,
                    "name": getattr(temp_instance.__class__, 'provider_name', provider_id),
                    "is_configured": is_configured,
                    "is_enabled": config.is_enabled if config else False,
                })
        
        return providers


def get_provider_manager(db: Session = Depends(get_db)) -> ProviderManager:
    """Get provider manager dependency"""
    return ProviderManager(db)
