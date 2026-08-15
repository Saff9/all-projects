"""Dashboard analytics routes."""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import get_session
from models import Confession, GameSession, VineCard, Vine, User
from schemas import DashboardStats
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/{vine_id}", response_model=DashboardStats)
async def stats(
    vine_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Vine).where(Vine.id == vine_id))
    vine = res.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")

    async def count(query):
        r = await session.execute(query)
        return int(r.scalar() or 0)

    total_conf = await count(select(func.count(Confession.id)).where(Confession.vine_id == vine_id))
    pending = await count(select(func.count(Confession.id)).where(Confession.vine_id == vine_id, Confession.status == "pending"))
    approved = await count(select(func.count(Confession.id)).where(Confession.vine_id == vine_id, Confession.status == "approved"))
    rejected = await count(select(func.count(Confession.id)).where(Confession.vine_id == vine_id, Confession.status == "rejected"))
    games = await count(select(func.count(GameSession.id)).where(GameSession.vine_id == vine_id))
    cards = await count(select(func.count(VineCard.id)).where(VineCard.vine_id == vine_id))

    today_start = datetime.now(timezone.utc) - timedelta(hours=24)
    today = await count(
        select(func.count(Confession.id)).where(
            Confession.vine_id == vine_id, Confession.created_at >= today_start
        )
    )

    return DashboardStats(
        total_confessions=total_conf,
        pending_count=pending,
        approved_count=approved,
        rejected_count=rejected,
        total_games=games,
        total_cards=cards,
        confessions_today=today,
    )
