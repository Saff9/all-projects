"""Telegram Stars payment handlers.

/boost — boost the last approved confession by paying STARS_BOOST_AMOUNT XTR.
/upgrade — upgrade the user's most recent vine to premium for STARS_PREMIUM_AMOUNT XTR.
"""
from __future__ import annotations
import logging
from telegram import Update, LabeledPrice
from telegram.ext import ContextTypes
from sqlalchemy import select, desc

from ..config import settings
from ..database import AsyncSessionLocal
from ..models import Vine, Confession

logger = logging.getLogger(__name__)


async def boost_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a Telegram Stars invoice to boost the last approved confession.

    We don't store user_id with confessions, so we rely on context.user_data.last_confession_id
    populated when the user submitted (in-process only).
    """
    if not update.message or not update.effective_user:
        return
    confession_id = context.user_data.get("last_confession_id")
    if not confession_id:
        await update.message.reply_text("No recent whisper to boost. Submit one first.")
        return
    title = "Boost a whisper"
    description = "Pin your latest confession to the top of the vine for 24h."
    payload = f"boost:{confession_id}"
    prices = [LabeledPrice(label="Boost", amount=settings.stars_boost_amount)]
    # provider_token is empty string for Stars (currency XTR)
    await context.bot.send_invoice(
        chat_id=update.message.chat_id,
        title=title,
        description=description,
        payload=payload,
        provider_token="",
        currency="XTR",
        prices=prices,
        start_parameter="boost",
    )


async def upgrade_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.effective_user:
        return
    user_id = update.effective_user.id
    async with AsyncSessionLocal() as session:
        vine = (await session.execute(
            select(Vine).where(Vine.creator_user_id == user_id).order_by(desc(Vine.created_at)).limit(1)
        )).scalar_one_or_none()
        if not vine:
            await update.message.reply_text("Create a vine first with /create.")
            return
    payload = f"upgrade:{vine.id}"
    prices = [LabeledPrice(label="Premium", amount=settings.stars_premium_amount)]
    await context.bot.send_invoice(
        chat_id=update.message.chat_id,
        title=f"Upgrade {vine.name}",
        description="Unlock custom branding, advanced analytics, and priority moderation for this vine.",
        payload=payload,
        provider_token="",
        currency="XTR",
        prices=prices,
        start_parameter="upgrade",
    )


async def precheckout(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    q = update.pre_checkout_query
    if q is None:
        return
    # Always approve — we validate in successful_payment
    await q.answer(ok=True)


async def successful_payment(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.message.successful_payment:
        return
    payload = update.message.successful_payment.invoice_payload
    if ":" not in payload:
        return
    kind, target_id = payload.split(":", 1)
    async with AsyncSessionLocal() as session:
        if kind == "boost":
            c = (await session.execute(select(Confession).where(Confession.id == target_id))).scalar_one_or_none()
            if c:
                c.is_boosted = True
                await session.commit()
                await update.message.reply_text("⭐ Boost applied — your whisper just floated to the top.")
        elif kind == "upgrade":
            v = (await session.execute(select(Vine).where(Vine.id == target_id))).scalar_one_or_none()
            if v:
                v.is_premium = True
                await session.commit()
                await update.message.reply_text(f"⭐ {v.name} is now premium.")
