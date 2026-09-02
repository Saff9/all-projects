"""/start handler — main menu + deep links (vine_<id>)."""
from __future__ import annotations
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes
from sqlalchemy import select

from ..database import AsyncSessionLocal
from ..models import User, Vine
from ..config import settings


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user = update.effective_user
    if not user:
        return
    args = context.args or []

    async with AsyncSessionLocal() as session:
        # ensure user exists
        existing = await session.execute(select(User).where(User.telegram_id == user.id))
        if not existing.scalar_one_or_none():
            session.add(User(telegram_id=user.id, username=user.username or ""))
            await session.commit()

        # deep link "vine_<id>"
        if args and args[0].startswith("vine_"):
            vine_id = args[0][5:]
            vine = (await session.execute(select(Vine).where(Vine.id == vine_id))).scalar_one_or_none()
            if vine:
                context.user_data["active_vine_id"] = vine.id
                kb = InlineKeyboardMarkup([
                    [InlineKeyboardButton("📝 Submit a confession", callback_data="confess_now")],
                    [InlineKeyboardButton("🪟 Open Mini App", web_app=WebAppInfo(url=settings.miniapp_base_url))],
                ])
                await update.message.reply_text(
                    f"Welcome to *{vine.name}*.\n\n_{vine.description or 'Whisper anything.'}_\n\n"
                    "Send me any private message and it'll be reposted to the vine *anonymously*. "
                    f"({settings.rate_limit_per_min}/min limit, AI moderated.)",
                    reply_markup=kb, parse_mode="Markdown",
                )
                return

    kb = InlineKeyboardMarkup([
        [InlineKeyboardButton("🌿 Open WhisperVine Mini App", web_app=WebAppInfo(url=settings.miniapp_base_url))],
        [InlineKeyboardButton("➕ Create a vine", callback_data="create_vine")],
    ])
    await update.message.reply_text(
        "*WhisperVine* — Anonymous confessions + AI games.\n\n"
        "Send me a private message to whisper into a vine you're a member of, "
        "or open the Mini App to create your own secret garden.\n\n"
        "Commands:\n"
        "• /create — create a vine\n"
        "• /boost — boost your last confession with Stars ⭐\n"
        "• /upgrade — upgrade your vine to premium with Stars ⭐\n"
        "• /generate_card <confession_id> — owner only, mint a Vine Card\n"
        "• /queue — owner approval queue",
        reply_markup=kb, parse_mode="Markdown",
    )


async def link_chat_to_vine(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """When the bot is added to a group/channel as admin and the owner posts /linkvine <vine_id>."""
    if not update.message or not context.args:
        return
    vine_id = context.args[0]
    chat = update.effective_chat
    user = update.effective_user
    if not chat or not user:
        return
    async with AsyncSessionLocal() as session:
        vine = (await session.execute(select(Vine).where(Vine.id == vine_id))).scalar_one_or_none()
        if not vine or vine.creator_user_id != user.id:
            await update.message.reply_text("That vine doesn't belong to you.")
            return
        vine.chat_id = chat.id
        await session.commit()
    await update.message.reply_text(f"✅ Vine *{vine.name}* is now linked to this chat.", parse_mode="Markdown")
