from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import uvicorn, logging, os, pathlib

from app.config import settings
from app.db.database import init_db
from app.tools import _register_all
from app.api.routes import agent, tasks, models
from app.api.routes.auth import router as auth_router
from app.api.routes.chat import router as chat_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("agentx")

FRONTEND_DIR = pathlib.Path(__file__).parent.parent.parent / "frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Starting AgentX…")
    await init_db()
    _register_all()
    from app.tools.registry import tool_registry
    os.makedirs(settings.WORKSPACE_DIR, exist_ok=True)
    provider = settings.get_active_provider()
    logger.info(f"✅ LLM provider: {provider} | Tools: {tool_registry.tool_names()}")
    if provider == "none":
        logger.warning("⚠️  No LLM provider! Set GROQ_API_KEY or OPENAI_API_KEY in .env")
    yield
    logger.info("Shutting down…")


app = FastAPI(
    title="AgentX",
    description="Autonomous AI Agent – OpenClaw-style agentic mode",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ───────────────────────────────────────────────────────────
app.include_router(auth_router,  prefix="/api/v1/auth",  tags=["Auth"])
app.include_router(chat_router,  prefix="/api/v1/chat",  tags=["Chat"])
app.include_router(agent.router, prefix="/api/v1/agent", tags=["Agent"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])
app.include_router(models.router, prefix="/api/v1/models", tags=["Models"])

# ── Health ────────────────────────────────────────────────────────────────
@app.get("/api/health", tags=["Health"])
async def health():
    from app.tools.registry import tool_registry
    return {
        "status": "healthy",
        "version": app.version,
        "llm_provider": settings.get_active_provider(),
        "tools": tool_registry.tool_names(),
    }

# Also keep /health for Render health check
@app.get("/health", include_in_schema=False)
async def health_alias():
    return {"status": "healthy"}

# ── WebSocket ─────────────────────────────────────────────────────────────
from app.api.websocket.streaming import ConnectionManager
ws_manager = ConnectionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await ws_manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.send_to_client(client_id, {"message": f"Echo: {data}"})
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)

# ── Serve Frontend (LAST so API routes take priority) ─────────────────────
if FRONTEND_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        """Serve frontend SPA for all non-API routes."""
        return FileResponse(str(FRONTEND_DIR / "index.html"))


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
