"""Anonymous confession routes.

PRIVACY INVARIANT:
- This endpoint accepts confessions WITHOUT authentication.
- Submitter identity is NEVER stored. We only store vine_id, content, emoji, status.
- Rate limiting uses an in-process TTL cache keyed by an opaque IP+UA fingerprint
  that is hashed and never persisted.
"""
from __future__ import annotations
import os
import hashlib
import random
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from cachetools import TTLCache

from database import get_session
from models import Confession, Vine, ModerationLog, User
from schemas import ConfessionCreate, ConfessionPublic, ConfessionSubmitResponse
from auth import get_current_user
from moderation import classify

router = APIRouter(prefix="/confessions", tags=["confessions"])

RATE_LIMIT_PER_MIN = int(os.environ.get("RATE_LIMIT_PER_MIN", "5"))
_rate_cache: TTLCache = TTLCache(maxsize=100_000, ttl=60)

_EMOJIS = ["🌿", "🌒", "🪐", "🦋", "🕯️", "🌊", "🍂", "🔮", "🌙", "🪞", "🍃", "🌫️", "🪷", "🪶"]


def _fingerprint(request: Request) -> str:
    ip = request.client.host if request.client else "?"
    ua = request.headers.get("user-agent", "?")
    return hashlib.sha256(f"{ip}|{ua}".encode()).hexdigest()


def _check_rate(fp: str) -> bool:
    now = time.time()
    bucket = _rate_cache.get(fp, [])
    bucket = [t for t in bucket if now - t < 60]
    if len(bucket) >= RATE_LIMIT_PER_MIN:
        return False
    bucket.append(now)
    _rate_cache[fp] = bucket
    return True


@router.post("/{vine_slug}", response_model=ConfessionSubmitResponse)
async def submit_confession(
    vine_slug: str,
    payload: ConfessionCreate,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    fp = _fingerprint(request)
    if not _check_rate(fp):
        raise HTTPException(429, f"Rate limit: {RATE_LIMIT_PER_MIN}/min")

    result = await session.execute(select(Vine).where(Vine.slug == vine_slug))
    vine = result.scalar_one_or_none()
    if not vine:
        raise HTTPException(404, "Vine not found")

    classification = await classify(payload.content, vine.moderation_strictness)

    if classification != "APPROVED":
        # Log without any submitter info
        session.add(ModerationLog(
            vine_id=vine.id,
            content_excerpt=payload.content[:160],
            classification=classification,
        ))
        await session.commit()
        return ConfessionSubmitResponse(
            status="rejected",
            message="Your whisper couldn't be posted. Try rephrasing — keep it kind and personal.",
        )

    status_val = "pending" if vine.requires_approval else "approved"
    confession = Confession(
        vine_id=vine.id,
        content=payload.content,
        emoji=random.choice(_EMOJIS),
        status=status_val,
    )
    session.add(confession)
    await session.commit()
    await session.refresh(confession)

    return ConfessionSubmitResponse(
        status=status_val,  # type: ignore
        confession=ConfessionPublic.model_validate(confession),
        message=("Whispered into the vine." if status_val == "approved"
                 else "Sent to the approval queue."),
    )


@router.get("/{vine_slug}", response_model=List[ConfessionPublic])
async def list_confessions(
    vine_slug: str,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Vine).where(Vine.slug == vine_slug))
    vine = result.scalar_one_or_none()
    if not vine:
        raise HTTPException(404, "Vine not found")
    res = await session.execute(
        select(Confession)
        .where(Confession.vine_id == vine.id, Confession.status == "approved")
        .order_by(desc(Confession.is_boosted), desc(Confession.created_at))
        .limit(min(limit, 200))
    )
    return [ConfessionPublic.model_validate(c) for c in res.scalars().all()]


@router.post("/{confession_id}/upvote", response_model=ConfessionPublic)
async def upvote_confession(
    confession_id: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Confession).where(Confession.id == confession_id))
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Not found")
    c.upvotes = (c.upvotes or 0) + 1
    await session.commit()
    await session.refresh(c)
    return ConfessionPublic.model_validate(c)


@router.get("/admin/{vine_id}/queue", response_model=List[ConfessionPublic])
async def approval_queue(
    vine_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Vine).where(Vine.id == vine_id))
    vine = res.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")
    res2 = await session.execute(
        select(Confession)
        .where(Confession.vine_id == vine_id, Confession.status == "pending")
        .order_by(desc(Confession.created_at))
    )
    return [ConfessionPublic.model_validate(c) for c in res2.scalars().all()]


@router.post("/admin/{confession_id}/approve", response_model=ConfessionPublic)
async def approve_confession(
    confession_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Confession).where(Confession.id == confession_id))
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Not found")
    res2 = await session.execute(select(Vine).where(Vine.id == c.vine_id))
    vine = res2.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")
    c.status = "approved"
    await session.commit()
    await session.refresh(c)
    return ConfessionPublic.model_validate(c)


@router.post("/admin/{confession_id}/reject", response_model=ConfessionPublic)
async def reject_confession(
    confession_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Confession).where(Confession.id == confession_id))
    c = res.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Not found")
    res2 = await session.execute(select(Vine).where(Vine.id == c.vine_id))
    vine = res2.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")
    c.status = "rejected"
    await session.commit()
    await session.refresh(c)
    return ConfessionPublic.model_validate(c)
