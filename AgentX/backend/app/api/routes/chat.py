"""
OpenClaw-style streaming chat endpoint.
POST /api/v1/chat/stream  →  Server-Sent Events (SSE)
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional

import aiosqlite
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.agent.runner import agent_runner, ConversationTurn
from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import TokenData
from app.config import settings

router = APIRouter()
DB = settings.DB_PATH


# ── DB helpers ────────────────────────────────────────────────────────────────
async def ensure_schema():
    async with aiosqlite.connect(DB) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT DEFAULT 'New Chat',
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                metadata TEXT DEFAULT '{}',
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )
        """)
        await db.commit()


async def get_or_create_session(session_id: Optional[str], user_id: str) -> str:
    async with aiosqlite.connect(DB) as db:
        if session_id:
            async with db.execute("SELECT id FROM sessions WHERE id=? AND user_id=?",
                                  (session_id, user_id)) as c:
                row = await c.fetchone()
            if row:
                return session_id
        new_id = str(uuid.uuid4())
        await db.execute(
            "INSERT INTO sessions (id, user_id) VALUES (?, ?)", (new_id, user_id)
        )
        await db.commit()
        return new_id


async def load_history(session_id: str) -> list[ConversationTurn]:
    async with aiosqlite.connect(DB) as db:
        async with db.execute(
            "SELECT role, content FROM messages WHERE session_id=? ORDER BY created_at LIMIT 20",
            (session_id,),
        ) as c:
            rows = await c.fetchall()
    return [ConversationTurn(role=r[0], content=r[1]) for r in rows]


async def save_message(session_id: str, role: str, content: str, metadata: dict = {}):
    async with aiosqlite.connect(DB) as db:
        await db.execute(
            "INSERT INTO messages (id, session_id, role, content, metadata) VALUES (?,?,?,?,?)",
            (str(uuid.uuid4()), session_id, role, content,
             json.dumps(metadata)),
        )
        await db.execute(
            "UPDATE sessions SET updated_at=datetime('now'), title=COALESCE(NULLIF(title,'New Chat'), ?) WHERE id=?",
            (content[:50], session_id),
        )
        await db.commit()


# ── Request / Response schemas ────────────────────────────────────────────────
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


# ── Streaming endpoint ────────────────────────────────────────────────────────
@router.post("/stream")
async def chat_stream(
    request: ChatRequest,
    user: TokenData = Depends(get_current_user),
):
    """Stream agent responses as Server-Sent Events."""
    await ensure_schema()
    session_id = await get_or_create_session(request.session_id, user.user_id)
    history = await load_history(session_id)
    await save_message(session_id, "user", request.message)

    answer_parts: list[str] = []

    async def event_stream() -> AsyncGenerator[str, None]:
        # Send session context first
        yield f"data: {json.dumps({'type': 'session', 'session_id': session_id})}\n\n"

        async for event in agent_runner.run_stream(request.message, history, session_id):
            yield event.to_sse()
            if event.type == "answer":
                answer_parts.append(event.data.get("content", ""))

        # Save assistant reply
        if answer_parts:
            await save_message(session_id, "assistant", answer_parts[0],
                               {"session_id": session_id})

        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Access-Control-Allow-Origin": "*",
        },
    )


# ── Session management ────────────────────────────────────────────────────────
@router.get("/sessions")
async def list_sessions(user: TokenData = Depends(get_current_user)):
    await ensure_schema()
    async with aiosqlite.connect(DB) as db:
        async with db.execute(
            "SELECT id, title, created_at, updated_at FROM sessions WHERE user_id=? ORDER BY updated_at DESC",
            (user.user_id,),
        ) as c:
            rows = await c.fetchall()
    return [{"id": r[0], "title": r[1], "created_at": r[2], "updated_at": r[3]} for r in rows]


@router.get("/sessions/{session_id}")
async def get_session_messages(
    session_id: str,
    user: TokenData = Depends(get_current_user),
):
    await ensure_schema()
    async with aiosqlite.connect(DB) as db:
        async with db.execute(
            "SELECT id FROM sessions WHERE id=? AND user_id=?", (session_id, user.user_id)
        ) as c:
            if not await c.fetchone():
                raise HTTPException(status_code=404, detail="Session not found")

        async with db.execute(
            "SELECT role, content, created_at FROM messages WHERE session_id=? ORDER BY created_at",
            (session_id,),
        ) as c:
            rows = await c.fetchall()

    return {"session_id": session_id, "messages": [
        {"role": r[0], "content": r[1], "created_at": r[2]} for r in rows
    ]}


@router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    user: TokenData = Depends(get_current_user),
):
    await ensure_schema()
    async with aiosqlite.connect(DB) as db:
        await db.execute(
            "DELETE FROM messages WHERE session_id=?", (session_id,)
        )
        await db.execute(
            "DELETE FROM sessions WHERE id=? AND user_id=?", (session_id, user.user_id)
        )
        await db.commit()
    return {"message": "Session deleted"}
