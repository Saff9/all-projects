"""
Agent goal endpoint – wired to the real AgentRunner via asyncio background tasks.
Use POST /api/v1/chat/stream for live streaming; this endpoint is for fire-and-forget goals.
"""
from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import uuid, aiosqlite

from app.agent.runner import agent_runner
from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import TokenData
from app.config import settings

router = APIRouter()


class GoalRequest(BaseModel):
    goal: str
    context: Optional[str] = None
    max_steps: Optional[int] = 15


async def _run_goal_bg(task_id: str, goal: str, user_id: str):
    """Background task: runs agent and writes final answer to DB."""
    answer = ""
    async for event in agent_runner.run_stream(goal):
        if event.type == "answer":
            answer = event.data.get("content", "")

    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute(
            "UPDATE agent_tasks SET status='done', result=?, updated_at=datetime('now') WHERE id=?",
            (answer, task_id),
        )
        await db.commit()


async def _ensure_tasks_table():
    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS agent_tasks (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                goal TEXT NOT NULL,
                status TEXT DEFAULT 'running',
                result TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            )
        """)
        await db.commit()


@router.post("/goal")
async def submit_goal(
    request: GoalRequest,
    background_tasks: BackgroundTasks,
    user: TokenData = Depends(get_current_user),
):
    """Submit a goal to run in the background. Poll /goal/{task_id} for status."""
    await _ensure_tasks_table()
    task_id = str(uuid.uuid4())
    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute(
            "INSERT INTO agent_tasks (id, user_id, goal) VALUES (?, ?, ?)",
            (task_id, user.user_id, request.goal),
        )
        await db.commit()

    background_tasks.add_task(_run_goal_bg, task_id, request.goal, user.user_id)
    return {"task_id": task_id, "status": "running", "message": "Goal submitted. Use /api/v1/chat/stream for live streaming."}


@router.get("/goal/{task_id}")
async def get_goal_status(task_id: str, user: TokenData = Depends(get_current_user)):
    await _ensure_tasks_table()
    async with aiosqlite.connect(settings.DB_PATH) as db:
        async with db.execute(
            "SELECT goal, status, result, created_at FROM agent_tasks WHERE id=? AND user_id=?",
            (task_id, user.user_id),
        ) as c:
            row = await c.fetchone()
    if not row:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Task not found")
    return {"task_id": task_id, "goal": row[0], "status": row[1], "result": row[2], "created_at": row[3]}
