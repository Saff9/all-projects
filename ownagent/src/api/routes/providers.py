"""
Provider API Routes
"""
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api.dependencies import get_db, get_provider_manager, ProviderManager
from src.models.database import ProviderConfig
from src.models.schemas import (
    ProviderListResponse, ProviderTestResponse,
    ProviderConfigRequest, ProviderConfigResponse,
    BaseResponse
)
from src.services.ai import get_provider_class, get_all_provider_ids
from src.core.exceptions import ProviderError

router = APIRouter(prefix="/api/v1/providers", tags=["providers"])


@router.get("", response_model=ProviderListResponse)
async def list_providers(
    db: Session = Depends(get_db),
    provider_manager: ProviderManager = Depends(get_provider_manager)
):
    """List all available AI providers and their status"""
    providers = []
    
    for provider_id in get_all_provider_ids():
        provider_class = get_provider_class(provider_id)
        if not provider_class:
            continue
        
        # Get config from database
        config = db.query(ProviderConfig).filter(
            ProviderConfig.provider_id == provider_id
        ).first()
        
        # Create a temporary instance to get metadata
        # We need to create with a dummy key for metadata access
        is_configured = config is not None and config.get_api_key() is not None
        
        # Get provider name from temporary instance
        try:
            temp_instance = provider_class.__new__(provider_class)
            provider_name = temp_instance.provider_name
        except Exception:
            provider_name = provider_id
        
        # Get models list
        models = []
        if provider_class:
            # Create instance with empty key just to get models
            try:
                temp_instance = provider_class.__new__(provider_class)
                models_data = temp_instance.get_models() if hasattr(temp_instance, 'get_models') else []
                models = [
                    {
                        "id": m.id,
                        "name": m.name,
                        "supports_vision": m.supports_vision,
                        "supports_streaming": m.supports_streaming,
                        "max_tokens": m.max_tokens
                    }
                    for m in models_data
                ]
            except Exception:
                pass
        
        providers.append({
            "id": provider_id,
            "name": provider_name,
            "status": "available" if is_configured else "unavailable",
            "is_configured": is_configured,
            "error": None if is_configured else "API key not configured",
            "models": models
        })
    
    return ProviderListResponse(data={"providers": providers})


@router.get("/{provider_id}")
async def get_provider(
    provider_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific provider details"""
    provider_class = get_provider_class(provider_id)
    if not provider_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown provider: {provider_id}"
        )
    
    config = db.query(ProviderConfig).filter(
        ProviderConfig.provider_id == provider_id
    ).first()
    
    is_configured = config is not None and config.get_api_key() is not None
    
    # Get models
    models = []
    try:
        temp_instance = provider_class.__new__(provider_class)
        models_data = temp_instance.get_models() if hasattr(temp_instance, 'get_models') else []
        models = [
            {
                "id": m.id,
                "name": m.name,
                "supports_vision": m.supports_vision,
                "supports_streaming": m.supports_streaming,
                "max_tokens": m.max_tokens
            }
            for m in models_data
        ]
    except Exception:
        pass
    
    # Get provider name from temporary instance
    try:
        provider_name = temp_instance.provider_name
    except Exception:
        provider_name = provider_id
    
    return BaseResponse(data={
        "id": provider_id,
        "name": provider_name,
        "status": "available" if is_configured else "unavailable",
        "is_configured": is_configured,
        "models": models,
        "base_url": config.base_url if config else None,
        "is_enabled": config.is_enabled if config else False
    })


@router.post("/{provider_id}/validate", response_model=ProviderTestResponse)
async def validate_provider(
    provider_id: str,
    db: Session = Depends(get_db),
    provider_manager: ProviderManager = Depends(get_provider_manager)
):
    """Test provider connectivity"""
    provider_class = get_provider_class(provider_id)
    if not provider_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown provider: {provider_id}"
        )
    
    # Get config
    config = db.query(ProviderConfig).filter(
        ProviderConfig.provider_id == provider_id
    ).first()
    
    if not config or not config.get_api_key():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Provider '{provider_id}' not configured"
        )
    
    try:
        # Create provider instance and test
        provider = provider_class(api_key=config.get_api_key(), base_url=config.base_url)
        
        start_time = time.time()
        result = await provider.validate_connection()
        latency_ms = int((time.time() - start_time) * 1000)
        
        if result.get("valid"):
            return ProviderTestResponse(data={
                "provider": provider_id,
                "status": "connected",
                "latency_ms": latency_ms,
                "tested_at": __import__('datetime').datetime.utcnow().isoformat()
            })
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=result.get("error", "Connection failed")
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


@router.put("/{provider_id}/api-key", response_model=ProviderConfigResponse)
async def configure_provider(
    provider_id: str,
    request: ProviderConfigRequest,
    db: Session = Depends(get_db)
):
    """Configure a provider API key"""
    provider_class = get_provider_class(provider_id)
    if not provider_class:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unknown provider: {provider_id}"
        )
    
    # Get or create config
    config = db.query(ProviderConfig).filter(
        ProviderConfig.provider_id == provider_id
    ).first()
    
    if not config:
        config = ProviderConfig(provider_id=provider_id)
        db.add(config)
    
    # Update config
    config.set_api_key(request.api_key)
    if request.base_url:
        config.base_url = request.base_url
    config.is_enabled = True
    
    db.commit()
    db.refresh(config)
    
    return ProviderConfigResponse(data=config.to_dict(mask_key=True))


@router.delete("/{provider_id}/api-key", response_model=BaseResponse)
async def remove_provider_config(
    provider_id: str,
    db: Session = Depends(get_db)
):
    """Remove provider configuration"""
    config = db.query(ProviderConfig).filter(
        ProviderConfig.provider_id == provider_id
    ).first()
    
    if config:
        db.delete(config)
        db.commit()
    
    return BaseResponse(message=f"Provider '{provider_id}' configuration removed")
