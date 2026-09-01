"""Vote callback handler for active games."""
from __future__ import annotations
import hashlib
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy import select, update as sql_update

from ..database import AsyncSessionLocal
from ..models import GameSession, GameVote, GameVoterFingerprint


async def vote_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    cq = update.callback_query
    if not cq or not cq.data or not cq.data.startswith("vote:"):
        return
    _, game_id, option = cq.data.split(":")
    user = cq.from_user
    if option not in ("a", "b"):
        await cq.answer("Bad option", show_alert=True)
        return

    # Per-session salted fingerprint: prevents double voting in this round only,
    # cannot correlate across games or to identity.
    fp = hashlib.sha256(f"{user.id}|{game_id}".encode()).hexdigest()

    async with AsyncSessionLocal() as session:
        gs = (await session.execute(select(GameSession).where(GameSession.id == game_id))).scalar_one_or_none()
        if not gs or not gs.is_active:
            await cq.answer("This round is closed.", show_alert=True)
            return

        existing = (await session.execute(
            select(GameVoterFingerprint).where(
                GameVoterFingerprint.game_session_id == gs.id,
                GameVoterFingerprint.fingerprint == fp,
            )
        )).scalar_one_or_none()
        if existing:
            await cq.answer("You already voted in this round.", show_alert=True)
            return

        session.add(GameVoterFingerprint(game_session_id=gs.id, fingerprint=fp))
        await session.execute(
            sql_update(GameVote)
            .where(GameVote.game_session_id == gs.id, GameVote.option == option)
            .values(count=GameVote.count + 1)
        )
        await session.commit()

        # Compose tally
        votes = (await session.execute(select(GameVote).where(GameVote.game_session_id == gs.id))).scalars().all()
        tally = {v.option: v.count for v in votes}
        a, b = tally.get("a", 0), tally.get("b", 0)
        total = max(a + b, 1)
        await cq.answer(
            f"✅ Vote cast.\n\n{gs.option_a}: {round(a/total*100)}%  ({a})\n{gs.option_b}: {round(b/total*100)}%  ({b})",
            show_alert=True,
        )
