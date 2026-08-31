"""Centralized configuration via environment variables."""
from __future__ import annotations
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    bot_token: str = os.environ["BOT_TOKEN"]
    database_url: str = os.environ["DATABASE_URL"]

    llm_provider: str = os.environ.get("LLM_PROVIDER", "openrouter").lower()
    openrouter_api_key: str = os.environ.get("OPENROUTER_API_KEY", "")
    openrouter_model: str = os.environ.get("OPENROUTER_MODEL", "meta-llama/llama-3.1-8b-instruct")
    groq_api_key: str = os.environ.get("GROQ_API_KEY", "")
    groq_model: str = os.environ.get("GROQ_MODEL", "llama3-8b-8192")

    replicate_api_token: str = os.environ.get("REPLICATE_API_TOKEN", "")
    replicate_model: str = os.environ.get(
        "REPLICATE_MODEL",
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
    )
    perspective_api_key: str = os.environ.get("PERSPECTIVE_API_KEY", "")

    miniapp_base_url: str = os.environ.get("MINIAPP_BASE_URL", "http://localhost:8080")
    miniapp_port: int = int(os.environ.get("MINIAPP_PORT", "8080"))
    webhook_url: str = os.environ.get("WEBHOOK_URL", "")
    webhook_secret: str = os.environ.get("WEBHOOK_SECRET", "")

    rate_limit_per_min: int = int(os.environ.get("RATE_LIMIT_PER_MIN", "5"))
    stars_boost_amount: int = int(os.environ.get("STARS_BOOST_AMOUNT", "50"))
    stars_premium_amount: int = int(os.environ.get("STARS_PREMIUM_AMOUNT", "500"))


settings = Settings()
