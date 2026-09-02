"""ORM models — Telegram bot version.

PRIVACY INVARIANT:
- The `confessions` table has NO user_id / sender_id column.
- `users` exists only for vine creators / admins, NOT confession submitters.
- Vote correlation is prevented via per-session salted fingerprints.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Text, Integer, BigInteger, Boolean, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from .database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    telegram_id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    username: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Vine(Base):
    __tablename__ = "vines"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    creator_user_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.telegram_id"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text, default="")
    chat_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, unique=True)
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    custom_branding: Mapped[dict] = mapped_column(JSONB, default=dict)
    game_schedule_hour: Mapped[int] = mapped_column(Integer, default=20)
    moderation_strictness: Mapped[str] = mapped_column(String(20), default="balanced")
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Confession(Base):
    __tablename__ = "confessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    content: Mapped[str] = mapped_column(Text)
    emoji: Mapped[str] = mapped_column(String(8), default="🌿")
    status: Mapped[str] = mapped_column(String(20), default="approved", index=True)
    is_boosted: Mapped[bool] = mapped_column(Boolean, default=False)
    flag_reason: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)


class GameSession(Base):
    __tablename__ = "game_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    game_type: Mapped[str] = mapped_column(String(30))
    question: Mapped[str] = mapped_column(Text)
    option_a: Mapped[str] = mapped_column(Text)
    option_b: Mapped[str] = mapped_column(Text)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class GameVote(Base):
    __tablename__ = "game_votes"
    __table_args__ = (UniqueConstraint("game_session_id", "option", name="uq_game_option"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("game_sessions.id"), index=True)
    option: Mapped[str] = mapped_column(String(1))
    count: Mapped[int] = mapped_column(Integer, default=0)


class GameVoterFingerprint(Base):
    __tablename__ = "game_voter_fingerprints"
    __table_args__ = (UniqueConstraint("game_session_id", "fingerprint", name="uq_session_fp"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("game_sessions.id"), index=True)
    fingerprint: Mapped[str] = mapped_column(String(64))


class VineCard(Base):
    __tablename__ = "vine_cards"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    confession_id: Mapped[str] = mapped_column(String(36), ForeignKey("confessions.id"), index=True)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    image_url: Mapped[str] = mapped_column(String(500))
    caption: Mapped[str] = mapped_column(Text, default="")
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class ModerationLog(Base):
    __tablename__ = "moderation_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    content_excerpt: Mapped[str] = mapped_column(String(160))
    classification: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
