"""Game session routes."""
from __future__ import annotations
import hashlib
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, update
from database import get_session
from models import Vine, GameSession, GameVote, GameVoterFingerprint, User
from schemas import GameSessionPublic, GameResults, VoteRequest
from auth import get_current_user
from games import start_game_for_vine

router = APIRouter(prefix="/games", tags=["games"])


def _fingerprint(request: Request, session_id: str) -> str:
    ip = request.client.host if request.client else "?"
    ua = request.headers.get("user-agent", "?")
    # Salt with session_id so the same fp varies between games (no cross-game correlation)
    return hashlib.sha256(f"{ip}|{ua}|{session_id}".encode()).hexdigest()


async def _build_results(session: AsyncSession, gs: GameSession, fp: Optional[str]) -> GameResults:
    res = await session.execute(select(GameVote).where(GameVote.game_session_id == gs.id))
    votes = {v.option: v.count for v in res.scalars().all()}
    a = votes.get("a", 0)
    b = votes.get("b", 0)
    total = max(a + b, 1)
    has_voted = False
    your_vote = None
    if fp:
        r = await session.execute(
            select(GameVoterFingerprint).where(
                GameVoterFingerprint.game_session_id == gs.id,
                GameVoterFingerprint.fingerprint == fp,
            )
        )
        has_voted = r.scalar_one_or_none() is not None
    return GameResults(
        game=GameSessionPublic.model_validate(gs),
        votes_a=a,
        votes_b=b,
        pct_a=round(a / total * 100, 1),
        pct_b=round(b / total * 100, 1),
        has_voted=has_voted,
        your_vote=your_vote,
    )


@router.get("/{vine_slug}/active", response_model=Optional[GameResults])
async def get_active_game(
    vine_slug: str,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Vine).where(Vine.slug == vine_slug))
    vine = res.scalar_one_or_none()
    if not vine:
        raise HTTPException(404, "Vine not found")
    res2 = await session.execute(
        select(GameSession)
        .where(GameSession.vine_id == vine.id, GameSession.is_active.is_(True))
        .order_by(desc(GameSession.start_time)).limit(1)
    )
    gs = res2.scalar_one_or_none()
    if not gs:
        return None
    # Auto-end if past end_time
    if gs.end_time and gs.end_time < datetime.now(timezone.utc):
        gs.is_active = False
        await session.commit()
    fp = _fingerprint(request, gs.id)
    return await _build_results(session, gs, fp)


@router.post("/{game_id}/vote", response_model=GameResults)
async def vote(
    game_id: str,
    payload: VoteRequest,
    request: Request,
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(GameSession).where(GameSession.id == game_id))
    gs = res.scalar_one_or_none()
    if not gs or not gs.is_active:
        raise HTTPException(400, "Game is not active")
    fp = _fingerprint(request, gs.id)
    # Already voted?
    r = await session.execute(
        select(GameVoterFingerprint).where(
            GameVoterFingerprint.game_session_id == gs.id,
            GameVoterFingerprint.fingerprint == fp,
        )
    )
    if r.scalar_one_or_none():
        raise HTTPException(409, "Already voted in this round")
    session.add(GameVoterFingerprint(game_session_id=gs.id, fingerprint=fp))
    await session.execute(
        update(GameVote)
        .where(GameVote.game_session_id == gs.id, GameVote.option == payload.option)
        .values(count=GameVote.count + 1)
    )
    await session.commit()
    return await _build_results(session, gs, fp)


@router.post("/{vine_id}/start", response_model=GameSessionPublic)
async def start_game(
    vine_id: str,
    game_type: str = "would_you_rather",
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    if game_type not in ("would_you_rather", "unpopular_opinion"):
        raise HTTPException(400, "invalid game_type")
    res = await session.execute(select(Vine).where(Vine.id == vine_id))
    vine = res.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")
    gs = await start_game_for_vine(session, vine_id, game_type)  # type: ignore
    return GameSessionPublic.model_validate(gs)


@router.post("/{game_id}/end", response_model=GameSessionPublic)
async def end_game(
    game_id: str,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(GameSession).where(GameSession.id == game_id))
    gs = res.scalar_one_or_none()
    if not gs:
        raise HTTPException(404, "Not found")
    res2 = await session.execute(select(Vine).where(Vine.id == gs.vine_id))
    vine = res2.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")
    gs.is_active = False
    await session.commit()
    await session.refresh(gs)
    return GameSessionPublic.model_validate(gs)
