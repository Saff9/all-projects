"""Tasks endpoint – tracks agent_tasks in SQLite."""
from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.auth.jwt_handler import TokenData
import aiosqlite
from app.config import settings

router = APIRouter()


@router.get("/")
async def list_tasks(user: TokenData = Depends(get_current_user)):
    async with aiosqlite.connect(settings.DB_PATH) as db:
        async with db.execute(
            "SELECT id, goal, status, created_at, updated_at FROM agent_tasks WHERE user_id=? ORDER BY created_at DESC LIMIT 50",
            (user.user_id,),
        ) as c:
            rows = await c.fetchall()
    return [{"id": r[0], "goal": r[1], "status": r[2], "created_at": r[3], "updated_at": r[4]} for r in rows]


@router.delete("/{task_id}")
async def delete_task(task_id: str, user: TokenData = Depends(get_current_user)):
    async with aiosqlite.connect(settings.DB_PATH) as db:
        result = await db.execute(
            "DELETE FROM agent_tasks WHERE id=? AND user_id=?", (task_id, user.user_id)
        )
        await db.commit()
        if result.rowcount == 0:
            raise HTTPException(404, "Task not found")
    return {"deleted": task_id}
