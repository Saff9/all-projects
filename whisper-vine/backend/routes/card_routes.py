"""Vine card (image) routes."""
from __future__ import annotations
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_session
from models import VineCard, Confession, Vine, User
from schemas import VineCardPublic, GenerateCardRequest
from auth import get_current_user
from vine_cards import generate_vine_card, STATIC_DIR

router = APIRouter(prefix="/cards", tags=["cards"])


@router.post("/generate", response_model=VineCardPublic)
async def generate(
    payload: GenerateCardRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    res = await session.execute(select(Confession).where(Confession.id == payload.confession_id))
    confession = res.scalar_one_or_none()
    if not confession:
        raise HTTPException(404, "Confession not found")
    res2 = await session.execute(select(Vine).where(Vine.id == confession.vine_id))
    vine = res2.scalar_one_or_none()
    if not vine or vine.creator_user_id != user.id:
        raise HTTPException(403, "Only the vine owner can generate cards")
    fname, _ = await generate_vine_card(confession.content)
    card = VineCard(
        confession_id=confession.id,
        vine_id=vine.id,
        image_path=fname,
        caption=confession.content[:160],
    )
    session.add(card)
    await session.commit()
    await session.refresh(card)
    return VineCardPublic.model_validate(card)


@router.get("/{vine_slug}", response_model=List[VineCardPublic])
async def list_cards(vine_slug: str, session: AsyncSession = Depends(get_session)):
    res = await session.execute(select(Vine).where(Vine.slug == vine_slug))
    vine = res.scalar_one_or_none()
    if not vine:
        raise HTTPException(404, "Vine not found")
    res2 = await session.execute(
        select(VineCard).where(VineCard.vine_id == vine.id).order_by(desc(VineCard.generated_at)).limit(60)
    )
    return [VineCardPublic.model_validate(c) for c in res2.scalars().all()]


@router.get("/image/{filename}")
async def card_image(filename: str):
    # Sanitize: only allow direct filename in STATIC_DIR
    if "/" in filename or ".." in filename:
        raise HTTPException(400, "Invalid filename")
    path = STATIC_DIR / filename
    if not path.exists():
        raise HTTPException(404, "Image not found")
    ext = filename.rsplit(".", 1)[-1].lower()
    media = {"png": "image/png", "jpg": "image/jpeg", "jpeg": "image/jpeg", "webp": "image/webp"}.get(ext, "application/octet-stream")
    return FileResponse(str(path), media_type=media)
