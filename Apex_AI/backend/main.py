# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.conversation import router as conversation_router
from routes.search import router as search_router
from database import init_db
app = FastAPI(
    title="Apex AI Backend",
    version="1.0.0",
)

# -------- CORS SETUP --------

# Both localhost and production preview (optional)
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",   # Svelte preview
    "http://127.0.0.1:4173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------- ROUTES --------

app.include_router(auth_router, prefix="/auth")
app.include_router(chat_router, prefix="/chat")
app.include_router(conversation_router, prefix="/conversations")
app.include_router(search_router, prefix="/search")

# -------- HEALTH CHECK --------

@app.get("/ping")
async def ping():
    return {"status": "ok", "message": "Apex AI backend is online."}


@app.on_event("startup")
async def startup_event():
    await init_db()
    print("✅ Database initialized!")
