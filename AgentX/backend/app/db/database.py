"""SQLite async database for AgentX."""
from __future__ import annotations
import aiosqlite
from app.config import settings


async def init_db():
    """Initialize SQLite schema on startup."""
    async with aiosqlite.connect(settings.DB_PATH) as db:
        # Sessions
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT DEFAULT 'New Chat',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        # Messages
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT DEFAULT '{}',
                created_at TEXT DEFAULT (datetime('now'))
            )
        """)
        # Agent memory
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agent_memory (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()


async def get_db():
    """Dependency that yields an aiosqlite connection."""
    async with aiosqlite.connect(settings.DB_PATH) as db:
        yield db
