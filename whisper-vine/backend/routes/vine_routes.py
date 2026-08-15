"""Vine CRUD routes."""
import re
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from database import get_session
from models import Vine, User
from schemas import VineCreate, VineUpdate, VinePublic
from auth import get_current_user

router = APIRouter(prefix="/vines", tags=["vines"])


def _slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return (s or "vine")[:60] + "-" + uuid.uuid4().hex[:6]


@router.post("", response_model=VinePublic)
async def create_vine(
    payload: VineCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    vine = Vine(
        creator_user_id=user.id,
        name=payload.name,
        slug=_slugify(payload.name),
        description=payload.description,
        moderation_strictness=payload.moderation_strictness,
        requires_approval=payload.requires_approval,
        game_schedule_hour=payload.game_schedule_hour,
    )
    session.add(vine)
    await session.commit()
    await session.refresh(vine)
    return VinePublic.model_validate(vine)


@router.get("", response_model=List[VinePublic])
async def list_my_vines(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Vine).where(Vine.creator_user_id == user.id).order_by(desc(Vine.created_at))
    )
    return [VinePublic.model_validate(v) for v in result.scalars().all()]


@router.get("/discover", response_model=List[VinePublic])
async def discover_vines(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Vine).order_by(desc(Vine.created_at)).limit(50))
    return [VinePublic.model_validate(v) for v in result.scalars().all()]


@router.get("/{slug}", response_model=VinePublic)
async def get_vine(slug: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Vine).where(Vine.slug == slug))
    vine = result.scalar_one_or_none()
    if not vine:
        raise HTTPException(404, "Vine not found")
    return VinePublic.model_validate(vine)


@router.patch("/{vine_id}", response_model=VinePublic)
async def update_vine(
    vine_id: str,
    payload: VineUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(select(Vine).where(Vine.id == vine_id))
    vine = result.scalar_one_or_none()
    if not vine:
        raise HTTPException(404, "Vine not found")
    if vine.creator_user_id != user.id:
        raise HTTPException(403, "Not your vine")
    data = payload.model_dump(exclude_unset=True)
    for k, v in data.items():
        setattr(vine, k, v)
    await session.commit()
    await session.refresh(vine)
    return VinePublic.model_validate(vine)
