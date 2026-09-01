"""Game generation + result rendering."""
from __future__ import annotations
import re
import json
import random
import logging
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Literal

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from openai import AsyncOpenAI
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings
from .database import AsyncSessionLocal
from .models import Vine, GameSession, GameVote

logger = logging.getLogger(__name__)
GameType = Literal["would_you_rather", "unpopular_opinion"]

_WYR_SYS = """You generate playful, slightly outrageous "Would You Rather" prompts for an anonymous social app.
Style: clever, surprising, suitable for adults, no harm, no real-person targets, no slurs, no NSFW.
Output ONLY a single JSON object with keys question, option_a, option_b. No prose."""

_UO_SYS = """You generate "Unpopular Opinion" battle statements for anonymous voting (Agree vs Disagree).
Single bold debatable opinion that splits the room. Pop culture, food, lifestyle, work, internet.
Avoid politics about real parties/people, slurs, harm.
Output ONLY a JSON object: question = the opinion sentence, option_a = "Agree", option_b = "Disagree"."""

_USER_TEMPLATES = {
    "would_you_rather": [
        "Awkward social dilemma.",
        "Two superpowers with hidden downsides.",
        "Tiny ethical compromise for a big reward.",
        "Modern internet life.",
        "Embarrassing public situation.",
    ],
    "unpopular_opinion": [
        "About food or coffee/tea culture.",
        "About working from home vs office.",
        "About modern movies or TV shows.",
        "About social media culture.",
        "About everyday small habits.",
    ],
}


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=0.5))
async def _llm(system_prompt: str, user_text: str) -> str:
    if settings.llm_provider == "groq":
        client = AsyncGroq(api_key=settings.groq_api_key)
        resp = await client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_text}],
            max_tokens=300, temperature=0.9,
        )
    else:
        client = AsyncOpenAI(api_key=settings.openrouter_api_key, base_url="https://openrouter.ai/api/v1")
        resp = await client.chat.completions.create(
            model=settings.openrouter_model,
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_text}],
            max_tokens=300, temperature=0.9,
        )
    return resp.choices[0].message.content or ""


async def generate_game(game_type: GameType) -> dict:
    sys = _WYR_SYS if game_type == "would_you_rather" else _UO_SYS
    user = random.choice(_USER_TEMPLATES[game_type])
    try:
        text = await asyncio.wait_for(_llm(sys, user), timeout=10.0)
        m = re.search(r"\{.*?\}", text, re.DOTALL)
        if not m:
            raise ValueError("non-JSON")
        data = json.loads(m.group(0))
        return {
            "question": str(data.get("question", "")).strip()[:500],
            "option_a": str(data.get("option_a", "")).strip()[:200],
            "option_b": str(data.get("option_b", "")).strip()[:200],
        }
    except Exception as e:
        logger.warning("Game gen fallback: %s", e)
        if game_type == "would_you_rather":
            return {
                "question": "Would you rather…",
                "option_a": "Always know when someone is lying (and they know you know)",
                "option_b": "Always get away with lying (but feel terrible guilt for a week)",
            }
        return {
            "question": "Pineapple on pizza is a crime against humanity.",
            "option_a": "Agree",
            "option_b": "Disagree",
        }


async def start_game_for_vine(
    session: AsyncSession, vine_id: str, game_type: GameType, duration_hours: int = 24
) -> GameSession:
    await session.execute(
        update(GameSession)
        .where(GameSession.vine_id == vine_id, GameSession.is_active.is_(True))
        .values(is_active=False)
    )
    data = await generate_game(game_type)
    now = datetime.now(timezone.utc)
    gs = GameSession(
        vine_id=vine_id, game_type=game_type,
        question=data["question"], option_a=data["option_a"], option_b=data["option_b"],
        start_time=now, end_time=now + timedelta(hours=duration_hours), is_active=True,
    )
    session.add(gs)
    await session.flush()
    session.add_all([
        GameVote(game_session_id=gs.id, option="a", count=0),
        GameVote(game_session_id=gs.id, option="b", count=0),
    ])
    await session.commit()
    await session.refresh(gs)
    return gs
