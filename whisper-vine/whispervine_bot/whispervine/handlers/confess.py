"""Anonymous confession proxy:
- User DMs the bot any private message (must have an active vine context via deep link).
- Bot moderates → posts to the linked vine chat as itself.
- NEVER stores submitter user_id with the confession.
"""
from __future__ import annotations
import random
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from sqlalchemy import select

from ..database import AsyncSessionLocal
from ..models import Vine, Confession, ModerationLog
from ..moderation import classify
from ..ratelimit import allow

logger = logging.getLogger(__name__)
_EMOJIS = ["🌿", "🌒", "🪐", "🦋", "🕯️", "🌊", "🍂", "🔮", "🌙", "🪞", "🍃", "🌫️", "🪷", "🪶"]


async def confess(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    msg = update.message
    if not msg or not msg.text or msg.chat.type != "private":
        return  # ignore non-private text
    user = update.effective_user
    if not user:
        return

    if not allow(user.id):
        await msg.reply_text("Slow down — rate limit reached. Try again in a minute.")
        return

    vine_id = context.user_data.get("active_vine_id")
    if not vine_id:
        await msg.reply_text(
            "Open a vine first. Use a vine invite link (`t.me/<bot>?start=vine_<id>`) "
            "or pick one in the Mini App."
        )
        return

    async with AsyncSessionLocal() as session:
        vine = (await session.execute(select(Vine).where(Vine.id == vine_id))).scalar_one_or_none()
        if not vine or not vine.chat_id:
            await msg.reply_text("That vine isn't linked to a chat yet.")
            return

        classification = await classify(msg.text, vine.moderation_strictness)
        if classification != "APPROVED":
            session.add(ModerationLog(vine_id=vine.id, content_excerpt=msg.text[:160], classification=classification))
            await session.commit()
            await msg.reply_text("Your whisper couldn't be posted. Try rephrasing — keep it kind and personal.")
            return

        if vine.requires_approval:
            confession = Confession(vine_id=vine.id, content=msg.text, emoji=random.choice(_EMOJIS), status="pending")
            session.add(confession)
            await session.commit()
            await msg.reply_text("📥 Sent to the approval queue.")
            return

        emoji = random.choice(_EMOJIS)
        confession = Confession(vine_id=vine.id, content=msg.text, emoji=emoji, status="approved")
        session.add(confession)
        await session.commit()
        await session.refresh(confession)
        # Remember last confession id for /boost (no user link in DB)
        context.user_data["last_confession_id"] = confession.id

    # Post to vine chat as the bot, no forward header, no sender info
    try:
        await context.bot.send_message(
            chat_id=vine.chat_id,
            text=f"{emoji} {msg.text}",
            disable_notification=False,
        )
        kb = InlineKeyboardMarkup([[InlineKeyboardButton("⭐ Boost (50 Stars)", callback_data=f"boost:{confession.id}")]])
        await msg.reply_text("🌿 Whispered into the vine.", reply_markup=kb)
    except Exception as e:
        logger.exception("post-to-vine failed: %s", e)
        await msg.reply_text("Couldn't post — the vine chat may have lost bot permissions.")
