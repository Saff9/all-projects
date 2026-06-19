"""
Settings API Routes
"""
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api.dependencies import get_db
from src.models.database import UserSetting, ProviderConfig
from src.models.schemas import (
    SettingsResponse, SettingsUpdateRequest,
    ProviderConfigRequest, ProviderConfigResponse,
    BaseResponse
)
from src.services.ai import get_all_provider_ids, get_provider_class

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])


DEFAULT_SETTINGS = {
    "general": {
        "theme": "dark",
        "language": "en",
        "font_size": "medium",
        "enter_to_send": True
    },
    "chat": {
        "default_provider": "openai",
        "default_model": "gpt-4",
        "temperature": 0.7,
        "max_tokens": 2000,
        "auto_save": True,
        "show_token_count": True
    },
    "features": {
        "web_search": {
            "enabled": True,
            "default_provider": "perplexity"
        },
        "file_upload": {
            "enabled": True,
            "max_file_size": 10485760,
            "allowed_types": ["pdf", "txt", "md", "csv", "json", "png", "jpg"]
        }
    }
}


def get_or_create_setting(db: Session, key: str, default_value: Any) -> Any:
    """Get setting or create with default value"""
    setting = db.query(UserSetting).filter(UserSetting.key == key).first()
    if not setting:
        setting = UserSetting(key=key, value=default_value)
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting.value


@router.get("", response_model=SettingsResponse)
async def get_settings(db: Session = Depends(get_db)):
    """Get all user settings"""
    settings = {}
    
    # Get general settings
    settings["general"] = get_or_create_setting(
        db, "general", DEFAULT_SETTINGS["general"]
    )
    
    # Get chat settings
    settings["chat"] = get_or_create_setting(
        db, "chat", DEFAULT_SETTINGS["chat"]
    )
    
    # Get features settings
    settings["features"] = get_or_create_setting(
        db, "features", DEFAULT_SETTINGS["features"]
    )
    
    # Get provider configs (masked)
    settings["providers"] = {}
    for provider_id in get_all_provider_ids():
        config = db.query(ProviderConfig).filter(
            ProviderConfig.provider_id == provider_id
        ).first()
        
        if config:
            settings["providers"][provider_id] = {
                "api_key": config.to_dict(mask_key=True).get("api_key"),
                "is_configured": config.to_dict(mask_key=True).get("is_configured")
            }
        else:
            settings["providers"][provider_id] = {
                "api_key": None,
                "is_configured": False
            }
    
    return SettingsResponse(data=settings)


@router.patch("", response_model=SettingsResponse)
async def update_settings(
    request: SettingsUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update settings"""
    if request.general:
        setting = db.query(UserSetting).filter(UserSetting.key == "general").first()
        if not setting:
            setting = UserSetting(key="general", value={})
            db.add(setting)
        
        current = setting.value or {}
        current.update(request.general.model_dump(exclude_unset=True))
        setting.value = current
    
    if request.chat:
        setting = db.query(UserSetting).filter(UserSetting.key == "chat").first()
        if not setting:
            setting = UserSetting(key="chat", value={})
            db.add(setting)
        
        current = setting.value or {}
        current.update(request.chat.model_dump(exclude_unset=True))
        setting.value = current
    
    if request.features:
        setting = db.query(UserSetting).filter(UserSetting.key == "features").first()
        if not setting:
            setting = UserSetting(key="features", value={})
            db.add(setting)
        
        current = setting.value or {}
        current.update(request.features.model_dump(exclude_unset=True))
        setting.value = current
    
    db.commit()
    
    # Return updated settings
    return await get_settings(db)


@router.put("/providers/{provider_id}", response_model=ProviderConfigResponse)
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


@router.delete("/providers/{provider_id}", response_model=BaseResponse)
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
