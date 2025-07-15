"""SQLite-backed persistent memory for the agent."""
from __future__ import annotations
import aiosqlite
from app.config import settings

_DB = settings.DB_PATH


async def _ensure_table():
    async with aiosqlite.connect(_DB) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agent_memory (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()


async def memory_store(key: str, value: str) -> str:
    await _ensure_table()
    async with aiosqlite.connect(_DB) as db:
        await db.execute(
            "INSERT OR REPLACE INTO agent_memory (key, value, updated_at) VALUES (?, ?, datetime('now'))",
            (key, value),
        )
        await db.commit()
    return f"Stored: {key} = {value}"


async def memory_retrieve(key: str) -> str:
    await _ensure_table()
    async with aiosqlite.connect(_DB) as db:
        async with db.execute(
            "SELECT value, updated_at FROM agent_memory WHERE key = ?", (key,)
        ) as cursor:
            row = await cursor.fetchone()
    if row:
        return f"Memory[{key}] = {row[0]} (stored at {row[1]})"
    return f"No memory found for key: '{key}'"
