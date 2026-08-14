"""Game engine: AI-generated Would You Rather + Unpopular Opinion battles.
Includes APScheduler-based daily game triggers per Vine.
"""
from __future__ import annotations
import os
import re
import json
import random
import logging
import uuid
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Literal, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from emergentintegrations.llm.chat import LlmChat, UserMessage

from database import AsyncSessionLocal
from models import Vine, GameSession, GameVote

logger = logging.getLogger(__name__)

LLM_MODEL = os.environ.get("LLM_MODEL_GAMES", "claude-sonnet-4-5-20250929")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

GameType = Literal["would_you_rather", "unpopular_opinion"]


_WYR_SYS = """You generate playful, slightly outrageous "Would You Rather" prompts for an anonymous social app.
Style: clever, surprising, suitable for adults but never harmful, no real-person targets, no slurs, no NSFW.
Output ONLY a single JSON object with keys: question, option_a, option_b. No prose.
"""

_WYR_USER_TEMPLATES = [
    "Generate a 'Would You Rather' about an awkward social dilemma.",
    "Generate a 'Would You Rather' that pits two superpowers with hidden downsides.",
    "Generate a 'Would You Rather' about a tiny ethical compromise for a big reward.",
    "Generate a 'Would You Rather' about modern internet life.",
    "Generate a 'Would You Rather' about embarrassing public situations.",
]

_UO_SYS = """You generate "Unpopular Opinion" battle statements for anonymous voting (Agree vs Disagree).
Style: a single bold, debatable opinion that splits the room. Pop culture, food, lifestyle, work, internet.
Avoid politics about real parties, real people, slurs, or harmful content.
Output ONLY a single JSON object with keys: question, option_a, option_b.
- question: the unpopular opinion as a single sentence statement.
- option_a: "Agree"
- option_b: "Disagree"
"""

_UO_USER_TEMPLATES = [
    "Generate an unpopular opinion about food/coffee/tea culture.",
    "Generate an unpopular opinion about working from home vs office.",
    "Generate an unpopular opinion about modern movies or TV shows.",
    "Generate an unpopular opinion about social media culture.",
    "Generate an unpopular opinion about everyday small habits.",
]


async def _llm_generate(system_prompt: str, user_text: str) -> dict:
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"game-{uuid.uuid4()}",
        system_message=system_prompt,
    ).with_model("anthropic", LLM_MODEL)
    raw = await chat.send_message(UserMessage(text=user_text))
    text = raw if isinstance(raw, str) else str(raw)
    m = re.search(r"\{.*?\}", text, re.DOTALL)
    if not m:
        raise ValueError(f"Game LLM returned non-JSON: {text[:200]}")
    return json.loads(m.group(0))


async def generate_game(game_type: GameType) -> dict:
    """Returns {question, option_a, option_b}."""
    if game_type == "would_you_rather":
        sys = _WYR_SYS
        user = random.choice(_WYR_USER_TEMPLATES)
    else:
        sys = _UO_SYS
        user = random.choice(_UO_USER_TEMPLATES)
    try:
        data = await asyncio.wait_for(_llm_generate(sys, user), timeout=10.0)
        return {
            "question": str(data.get("question", "")).strip()[:500],
            "option_a": str(data.get("option_a", "")).strip()[:200],
            "option_b": str(data.get("option_b", "")).strip()[:200],
        }
    except Exception as e:
        logger.warning("Game generation fallback (LLM error: %s)", e)
        # Fallback static set
        if game_type == "would_you_rather":
            return {
                "question": "Would you rather...",
                "option_a": "Always know when someone is lying, but they know you know.",
                "option_b": "Always get away with lying, but feel terrible guilt for a week.",
            }
        return {
            "question": "Pineapple on pizza is a crime against humanity.",
            "option_a": "Agree",
            "option_b": "Disagree",
        }


async def start_game_for_vine(
    session: AsyncSession,
    vine_id: str,
    game_type: GameType,
    duration_hours: int = 24,
) -> GameSession:
    # Close any active games for the vine first
    await session.execute(
        update(GameSession)
        .where(GameSession.vine_id == vine_id, GameSession.is_active.is_(True))
        .values(is_active=False)
    )
    data = await generate_game(game_type)
    now = datetime.now(timezone.utc)
    gs = GameSession(
        vine_id=vine_id,
        game_type=game_type,
        question=data["question"],
        option_a=data["option_a"],
        option_b=data["option_b"],
        start_time=now,
        end_time=now + timedelta(hours=duration_hours),
        is_active=True,
    )
    session.add(gs)
    await session.flush()
    # Initialize vote counters
    session.add_all([
        GameVote(game_session_id=gs.id, option="a", count=0),
        GameVote(game_session_id=gs.id, option="b", count=0),
    ])
    await session.commit()
    await session.refresh(gs)
    logger.info("Started game %s for vine %s (%s)", gs.id, vine_id, game_type)
    return gs


# ----- Scheduler -----
scheduler: Optional[AsyncIOScheduler] = None


async def _daily_tick() -> None:
    """Run hourly: for each vine whose game_schedule_hour == current UTC hour and no active game, start one."""
    now = datetime.now(timezone.utc)
    current_hour = now.hour
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(Vine).where(Vine.game_schedule_hour == current_hour)
        )
        vines = result.scalars().all()
        for vine in vines:
            active = await session.execute(
                select(GameSession).where(
                    GameSession.vine_id == vine.id, GameSession.is_active.is_(True)
                )
            )
            if active.scalar_one_or_none() is None:
                game_type = random.choice(["would_you_rather", "unpopular_opinion"])
                try:
                    await start_game_for_vine(session, vine.id, game_type)  # type: ignore
                except Exception as e:
                    logger.exception("daily_tick: failed to start game for vine %s: %s", vine.id, e)


def start_scheduler() -> None:
    global scheduler
    if scheduler:
        return
    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(_daily_tick, "cron", minute=2)  # check every hour at minute :02
    scheduler.start()
    logger.info("APScheduler started (hourly daily_tick).")
