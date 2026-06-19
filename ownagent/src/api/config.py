"""
Configuration management for Apex Smart API
"""
import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    
    # App
    APP_NAME: str = "Apex Smart API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = "sqlite:///./data/genzsmart.db"
    
    # Security
    ENCRYPTION_KEY: Optional[str] = None
    
    # File Upload
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_TYPES: list = [
        "text/plain",
        "text/markdown",
        "text/csv",
        "application/json",
        "application/pdf",
        "image/png",
        "image/jpeg",
    ]
    
    # CORS - Restrict origins for security
    CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"]
    
    class Config:
        env_file = ".env"
        env_prefix = "GENZSMART_"


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings"""
    return settings


def ensure_directories() -> None:
    """Ensure required directories exist"""
    os.makedirs("./data", exist_ok=True)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
