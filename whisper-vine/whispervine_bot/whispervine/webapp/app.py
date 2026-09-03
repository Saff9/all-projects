"""FastAPI Mini App for WhisperVine — vine management + dashboard analytics.

Authenticated via Telegram WebApp `initData` HMAC validation.
Run alongside the bot in the same process (see whispervine.main).
"""
from __future__ import annotations
from datetime import datetime, timedelta, timezone
from pathlib import Path
from fastapi import FastAPI, Request, HTTPException, Form, Depends
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import select, func, desc

from ..database import AsyncSessionLocal
from ..models import User, Vine, Confession, GameSession, VineCard
from .auth import validate_init_data

BASE_DIR = Path(__file__).parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

app = FastAPI(title="WhisperVine Mini App")


async def current_user(request: Request) -> dict:
    init_data = request.headers.get("X-Telegram-Init-Data") or request.query_params.get("tgWebAppData")
    user = validate_init_data(init_data or "")
    if not user:
        raise HTTPException(status_code=401, detail="Invalid Telegram init data")
    return user


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})


@app.get("/create", response_class=HTMLResponse)
async def create_page(request: Request):
    return templates.TemplateResponse("create.html", {"request": request})


@app.get("/api/me")
async def me(user: dict = Depends(current_user)):
    return user


@app.get("/api/vines")
async def my_vines(user: dict = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        res = await session.execute(
            select(Vine).where(Vine.creator_user_id == user["id"]).order_by(desc(Vine.created_at))
        )
        vines = []
        for v in res.scalars().all():
            vines.append({
                "id": v.id, "name": v.name, "description": v.description,
                "is_premium": v.is_premium, "chat_id": v.chat_id,
                "moderation_strictness": v.moderation_strictness,
                "requires_approval": v.requires_approval,
                "game_schedule_hour": v.game_schedule_hour,
            })
        return vines


@app.post("/api/vines")
async def create_vine(payload: dict, user: dict = Depends(current_user)):
    name = payload.get("name", "").strip()
    if not name:
        raise HTTPException(400, "name required")
    async with AsyncSessionLocal() as session:
        existing_user = (await session.execute(select(User).where(User.telegram_id == user["id"]))).scalar_one_or_none()
        if not existing_user:
            session.add(User(telegram_id=user["id"], username=user.get("username", "")))
        v = Vine(
            creator_user_id=user["id"],
            name=name[:80],
            description=payload.get("description", "")[:600],
            moderation_strictness=payload.get("moderation_strictness", "balanced"),
            requires_approval=bool(payload.get("requires_approval", False)),
            game_schedule_hour=int(payload.get("game_schedule_hour", 20)),
        )
        session.add(v)
        await session.commit()
        await session.refresh(v)
        return {"id": v.id, "name": v.name}


@app.get("/api/vines/{vine_id}/stats")
async def stats(vine_id: str, user: dict = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        v = (await session.execute(select(Vine).where(Vine.id == vine_id))).scalar_one_or_none()
        if not v or v.creator_user_id != user["id"]:
            raise HTTPException(403, "not your vine")

        async def cnt(q):
            return int((await session.execute(q)).scalar() or 0)

        today = datetime.now(timezone.utc) - timedelta(hours=24)
        return {
            "total": await cnt(select(func.count(Confession.id)).where(Confession.vine_id == vine_id)),
            "today": await cnt(select(func.count(Confession.id)).where(Confession.vine_id == vine_id, Confession.created_at >= today)),
            "pending": await cnt(select(func.count(Confession.id)).where(Confession.vine_id == vine_id, Confession.status == "pending")),
            "games": await cnt(select(func.count(GameSession.id)).where(GameSession.vine_id == vine_id)),
            "cards": await cnt(select(func.count(VineCard.id)).where(VineCard.vine_id == vine_id)),
        }


@app.get("/api/vines/{vine_id}/queue")
async def queue(vine_id: str, user: dict = Depends(current_user)):
    async with AsyncSessionLocal() as session:
        v = (await session.execute(select(Vine).where(Vine.id == vine_id))).scalar_one_or_none()
        if not v or v.creator_user_id != user["id"]:
            raise HTTPException(403, "not your vine")
        res = await session.execute(
            select(Confession).where(Confession.vine_id == vine_id, Confession.status == "pending").order_by(desc(Confession.created_at))
        )
        return [{"id": c.id, "content": c.content, "emoji": c.emoji, "created_at": c.created_at.isoformat()} for c in res.scalars().all()]
