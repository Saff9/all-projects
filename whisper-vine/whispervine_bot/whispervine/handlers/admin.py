"""Owner-only commands: /generate_card, /queue, /create."""
from __future__ import annotations
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
from sqlalchemy import select, desc

from ..database import AsyncSessionLocal
from ..models import Vine, Confession, VineCard
from ..vine_cards import generate_vine_card

logger = logging.getLogger(__name__)


async def create_vine_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """/create <name> — create a vine quickly. Use Mini App for full settings."""
    user = update.effective_user
    if not user or not update.message:
        return
    name = " ".join(context.args or []).strip() or "Untitled Vine"
    async with AsyncSessionLocal() as session:
        vine = Vine(creator_user_id=user.id, name=name[:80])
        session.add(vine)
        await session.commit()
        await session.refresh(vine)
    await update.message.reply_text(
        f"🌱 Created vine *{name}* — id `{vine.id}`.\n\n"
        f"1. Add me to a group/channel as admin.\n"
        f"2. In that chat run `/linkvine {vine.id}`.\n"
        f"3. Share invite link: `t.me/{(context.bot.username or 'YourBot')}?start=vine_{vine.id}`",
        parse_mode="Markdown",
    )


async def generate_card(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.effective_user:
        return
    if not context.args:
        await update.message.reply_text("Usage: /generate_card <confession_id>")
        return
    confession_id = context.args[0]
    async with AsyncSessionLocal() as session:
        c = (await session.execute(select(Confession).where(Confession.id == confession_id))).scalar_one_or_none()
        if not c:
            await update.message.reply_text("Confession not found.")
            return
        vine = (await session.execute(select(Vine).where(Vine.id == c.vine_id))).scalar_one_or_none()
        if not vine or vine.creator_user_id != update.effective_user.id:
            await update.message.reply_text("Only the vine owner can mint cards.")
            return
        await update.message.reply_text("Conjuring a Vine Card… (this can take ~30s)")
        try:
            url = await generate_vine_card(c.content)
        except Exception as e:
            logger.exception("Card gen failed: %s", e)
            await update.message.reply_text(f"Generation failed: {e}")
            return
        card = VineCard(confession_id=c.id, vine_id=vine.id, image_url=url, caption=c.content[:160])
        session.add(card)
        await session.commit()
        await session.refresh(card)

    if vine.chat_id:
        try:
            await context.bot.send_photo(chat_id=vine.chat_id, photo=url, caption=f"🪞 Vine Card\n_{c.content[:600]}_", parse_mode="Markdown")
        except Exception as e:
            logger.warning("Send to vine failed: %s", e)
    await update.message.reply_text(f"✅ Card minted: {url}")


async def queue_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    if not update.message or not update.effective_user:
        return
    user_id = update.effective_user.id
    async with AsyncSessionLocal() as session:
        vines = (await session.execute(select(Vine).where(Vine.creator_user_id == user_id))).scalars().all()
        if not vines:
            await update.message.reply_text("You don't own any vines.")
            return
        buttons = []
        for v in vines:
            res = await session.execute(
                select(Confession).where(Confession.vine_id == v.id, Confession.status == "pending").order_by(desc(Confession.created_at)).limit(1)
            )
            pending = res.scalar_one_or_none()
            if pending:
                buttons.append([
                    InlineKeyboardButton(f"✅ Approve [{v.name}]", callback_data=f"qmod:approve:{pending.id}"),
                    InlineKeyboardButton(f"✖ Reject", callback_data=f"qmod:reject:{pending.id}"),
                ])
                await update.message.reply_text(
                    f"📥 *{v.name}* — pending:\n\n{pending.emoji} {pending.content}",
                    reply_markup=InlineKeyboardMarkup(buttons[-1:]),
                    parse_mode="Markdown",
                )
        if not buttons:
            await update.message.reply_text("No pending confessions in your vines.")


async def queue_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    cq = update.callback_query
    if not cq or not cq.data or not cq.data.startswith("qmod:"):
        return
    _, action, cid = cq.data.split(":")
    user_id = cq.from_user.id
    async with AsyncSessionLocal() as session:
        c = (await session.execute(select(Confession).where(Confession.id == cid))).scalar_one_or_none()
        if not c:
            await cq.answer("Not found", show_alert=True); return
        vine = (await session.execute(select(Vine).where(Vine.id == c.vine_id))).scalar_one_or_none()
        if not vine or vine.creator_user_id != user_id:
            await cq.answer("Not your vine", show_alert=True); return
        c.status = "approved" if action == "approve" else "rejected"
        await session.commit()
        if action == "approve" and vine.chat_id:
            try:
                await context.bot.send_message(chat_id=vine.chat_id, text=f"{c.emoji} {c.content}")
            except Exception:
                pass
    await cq.answer(f"{action}d", show_alert=False)
    if cq.message:
        await cq.message.edit_reply_markup(reply_markup=None)
