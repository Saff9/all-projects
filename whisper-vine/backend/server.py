"""WhisperVine FastAPI server (PostgreSQL + async SQLAlchemy).

Exposes:
- /api/auth/*           JWT signup/login
- /api/vines/*          Vine CRUD (auth required for create/update; discover/get is public)
- /api/confessions/*    Anonymous submission (no auth), feed, owner approval queue
- /api/games/*          Game session, anonymous voting
- /api/cards/*          Vine Card image generation + serving
- /api/dashboard/*      Owner analytics
- /api/                 Health check
"""
from __future__ import annotations
import os
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("whispervine")

from database import init_db
from games import start_scheduler
from routes.auth_routes import router as auth_router
from routes.vine_routes import router as vine_router
from routes.confession_routes import router as confession_router
from routes.game_routes import router as game_router
from routes.card_routes import router as card_router
from routes.dashboard_routes import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing WhisperVine database…")
    await init_db()
    start_scheduler()
    logger.info("WhisperVine ready.")
    yield


app = FastAPI(title="WhisperVine API", version="1.0.0", lifespan=lifespan)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"app": "WhisperVine", "status": "ok"}


@api_router.get("/download/whispervine_full.zip")
async def download_full_source():
    """Download the full WhisperVine source bundle (live web app + Telegram bot)."""
    from fastapi.responses import FileResponse
    from pathlib import Path
    p = Path(__file__).parent / "static" / "downloads" / "whispervine_full.zip"
    if not p.exists():
        from fastapi import HTTPException
        raise HTTPException(404, "Bundle not built")
    return FileResponse(
        str(p),
        media_type="application/zip",
        filename="whispervine_full.zip",
    )


api_router.include_router(auth_router)
api_router.include_router(vine_router)
api_router.include_router(confession_router)
api_router.include_router(game_router)
api_router.include_router(card_router)
api_router.include_router(dashboard_router)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
