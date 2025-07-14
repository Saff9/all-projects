"""
Models endpoint – returns available LLM providers based on configured API keys.
No in-memory storage; single source of truth is config + env vars.
"""
from fastapi import APIRouter
from app.config import settings

router = APIRouter()

_ALL_MODELS = [
    {"id": "gpt-4o-mini",             "name": "GPT-4o Mini",          "provider": "openai",    "speed": "fast"},
    {"id": "gpt-4o",                  "name": "GPT-4o",               "provider": "openai",    "speed": "medium"},
    {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku",       "provider": "anthropic", "speed": "fast"},
    {"id": "claude-3-5-sonnet-20241022","name": "Claude 3.5 Sonnet",  "provider": "anthropic", "speed": "medium"},
    {"id": "llama3-70b-8192",         "name": "LLaMA 3 70B (Groq)",   "provider": "groq",      "speed": "very_fast"},
    {"id": "mixtral-8x7b-32768",      "name": "Mixtral 8x7B (Groq)",  "provider": "groq",      "speed": "very_fast"},
    {"id": "llama3",                  "name": "LLaMA 3 (Ollama)",     "provider": "ollama",    "speed": "local"},
]


@router.get("/")
async def list_models():
    """Return all models, marked as available if the provider API key is configured."""
    active = settings.get_active_provider()
    result = []
    for m in _ALL_MODELS:
        available = False
        if m["provider"] == "openai" and settings.OPENAI_API_KEY:
            available = True
        elif m["provider"] == "anthropic" and settings.ANTHROPIC_API_KEY:
            available = True
        elif m["provider"] == "groq" and settings.GROQ_API_KEY:
            available = True
        elif m["provider"] == "ollama" and settings.OLLAMA_BASE_URL:
            available = True
        result.append({**m, "available": available})
    return {"active_provider": active, "models": result}
