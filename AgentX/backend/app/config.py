from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    APP_NAME: str = "AgentX"
    DEBUG: bool = False

    # ── Security ──────────────────────────────────────────────────────────
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── Database (SQLite – lightweight, zero config) ──────────────────────
    DB_PATH: str = "./agentx.db"

    # ── CORS ──────────────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = ["*"]

    # ── LLM Providers (set at least one) ─────────────────────────────────
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None          # Free tier, fast!
    OLLAMA_BASE_URL: Optional[str] = None        # Local models

    # Default model (auto-selected based on available keys)
    DEFAULT_MODEL: str = "auto"

    # ── Agent Settings ────────────────────────────────────────────────────
    MAX_AGENT_STEPS: int = 15
    AGENT_TIMEOUT_SECONDS: int = 120
    WORKSPACE_DIR: str = "./workspace"          # safe dir for file tools

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @field_validator("SECRET_KEY", mode="before")
    @classmethod
    def secret_key_must_be_set(cls, v: str) -> str:
        return v if v else secrets.token_urlsafe(64)

    def get_active_provider(self) -> str:
        """Return the first available LLM provider."""
        if self.OPENAI_API_KEY:
            return "openai"
        if self.ANTHROPIC_API_KEY:
            return "anthropic"
        if self.GROQ_API_KEY:
            return "groq"
        if self.OLLAMA_BASE_URL:
            return "ollama"
        return "none"


settings = Settings()
