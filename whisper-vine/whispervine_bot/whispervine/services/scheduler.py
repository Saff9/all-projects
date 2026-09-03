"""APScheduler hourly tick: starts a daily game for any vine whose schedule_hour == current UTC hour."""
from __future__ import annotations
import logging
import random
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy import select
from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup

from ..database import AsyncSessionLocal
from ..models import Vine, GameSession
from ..games import start_game_for_vine

logger = logging.getLogger(__name__)


def make_scheduler(bot: Bot) -> AsyncIOScheduler:
    sched = AsyncIOScheduler(timezone="UTC")

    async def tick() -> None:
        hour = datetime.now(timezone.utc).hour
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(Vine).where(Vine.game_schedule_hour == hour))
            for vine in res.scalars().all():
                if not vine.chat_id:
                    continue
                # skip if active game exists
                active = await session.execute(
                    select(GameSession).where(GameSession.vine_id == vine.id, GameSession.is_active.is_(True))
                )
                if active.scalar_one_or_none():
                    continue
                game_type = random.choice(["would_you_rather", "unpopular_opinion"])
                gs = await start_game_for_vine(session, vine.id, game_type)
                # Post game to vine chat
                try:
                    kb = InlineKeyboardMarkup([
                        [InlineKeyboardButton(gs.option_a, callback_data=f"vote:{gs.id}:a")],
                        [InlineKeyboardButton(gs.option_b, callback_data=f"vote:{gs.id}:b")],
                    ])
                    title = "Would you rather" if game_type == "would_you_rather" else "Unpopular opinion"
                    await bot.send_message(
                        chat_id=vine.chat_id,
                        text=f"🎲 *{title}*\n\n{gs.question}",
                        reply_markup=kb,
                        parse_mode="Markdown",
                    )
                except Exception as e:
                    logger.exception("Failed to post game to vine %s: %s", vine.id, e)

    sched.add_job(tick, "cron", minute=2)  # every hour at :02
    return sched
