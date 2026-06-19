"""
API Routes
"""
from fastapi import APIRouter

from src.api.routes import chat, providers, files, settings, memory, search

# Create main router
router = APIRouter()

# Include all route modules
router.include_router(chat.router)
router.include_router(providers.router)
router.include_router(files.router)
router.include_router(settings.router)
router.include_router(memory.router)
router.include_router(search.router)

__all__ = ["router"]
