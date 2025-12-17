import os
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from app.api.endpoints import router as api_router, get_active_engine
from app.services.vfs import init_db, engine
from app.models.schemas import AppSettings
from app.core.config import settings as app_config
from sqlmodel import Session

logger = logging.getLogger("televault.main")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


async def _async_startup_telegram_connect():
    try:
        with Session(engine) as session:
            app_settings = session.get(AppSettings, 1)
            if app_settings and app_settings.telegram_session_string:
                api_id = app_settings.telegram_api_id or app_config.DEFAULT_API_ID
                api_hash = app_settings.telegram_api_hash or app_config.DEFAULT_API_HASH
                tg = get_active_engine(
                    session_str=app_settings.telegram_session_string,
                    api_id=api_id,
                    api_hash=api_hash
                )
                await asyncio.wait_for(tg.ensure_connected(), timeout=5.0)

                # If running in bot mode, re-attach event listeners
                if app_settings.telegram_bot_token:
                    tg.bot_token = app_settings.telegram_bot_token
                    tg.attach_bot_event_handlers()
                    logger.info("[TeleVault] Bot event handlers attached & listening.")

                logger.info(f"[TeleVault] Resumed active Telegram connection ({app_settings.telegram_phone}).")
    except asyncio.TimeoutError:
        logger.warning("[TeleVault] Telegram background connection timed out; will reconnect on demand.")
    except Exception as e:
        logger.warning(f"[TeleVault] Telegram startup reconnection notice: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Auto-resume Telegram connection non-blockingly
    init_db()
    logger.info("[TeleVault] Core Engine started. SQLite VFS initialized.")

    asyncio.create_task(_async_startup_telegram_connect())

    yield


    # Shutdown: Gracefully disconnect Telegram client
    try:
        tg = get_active_engine()
        if tg and tg.client and tg.client.is_connected():
            logger.info("[TeleVault] Disconnecting Telegram MTProto client...")
            await tg.client.disconnect()
            logger.info("[TeleVault] Telegram client disconnected cleanly.")
    except Exception as e:
        logger.debug(f"[TeleVault] Disconnect notice on shutdown: {e}")


app = FastAPI(
    title="TeleVault Engine",
    description="Zero-Knowledge Telegram MTProto Cloud Storage Engine",
    version="2.0.0",
    lifespan=lifespan
)

# Robust CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost",
        "http://127.0.0.1",
        "capacitor://localhost"
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"[TeleVault] Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )


# Frontend static files serving
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def index():
        return {
            "name": "TeleVault Backend Engine",
            "version": "2.0.0",
            "status": "online",
            "docs": "/docs",
            "api": "/api/status"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=app_config.HOST, port=app_config.PORT, reload=True)
