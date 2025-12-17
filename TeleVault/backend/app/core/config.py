import os
from pydantic import BaseModel
from typing import Optional

class Settings(BaseModel):
    # Telegram API Defaults (Official Desktop Credentials fallback)
    DEFAULT_API_ID: int = int(os.getenv("TELEVAULT_API_ID", "2040"))
    DEFAULT_API_HASH: str = os.getenv("TELEVAULT_API_HASH", "b18441a1ff607e10a989891a5462e627")
    
    # Vault Configuration
    VAULT_CHANNEL_TITLE: str = os.getenv("TELEVAULT_CHANNEL_TITLE", "🛡️ TeleVault [Encrypted Storage - Do Not Delete]")
    DATABASE_URL: str = os.getenv("TELEVAULT_DB_URL", "sqlite:///./televault.db")
    
    # Chunk and Rate Limit Configuration
    DEFAULT_CHUNK_SIZE: int = 10 * 1024 * 1024  # 10 MB default chunk
    MAX_CHUNK_SIZE: int = 100 * 1024 * 1024    # 100 MB max chunk size
    MAX_FLOOD_WAIT_SECONDS: int = 60
    
    # Host and Port
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
