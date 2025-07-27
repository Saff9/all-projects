# backend/services/model_router.py

from services.search_engine import run_search_query
from services.model_driver import (
    call_groq,
    call_huggingface,
    call_openrouter,
)


async def route_model(model: str, prompt: str):
    # Web search mode
    if model.startswith("web:"):
        return await run_search_query(prompt)

    # Groq models (g:<model>)
    if model.startswith("g:"):
        pure_model = model.replace("g:", "")
        return await call_groq(pure_model, prompt)

    # HuggingFace models (hf:<model>)
    if model.startswith("hf:"):
        pure_model = model.replace("hf:", "")
        return await call_huggingface(pure_model, prompt)

    # OpenRouter models (or:<model>)
    if model.startswith("or:"):
        pure_model = model.replace("or:", "")
        return await call_openrouter(pure_model, prompt)

    # fallback
    return "⚠️ Unknown model prefix. Use g: / hf: / or: / web:"
