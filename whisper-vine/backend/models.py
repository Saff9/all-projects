"""ORM models for WhisperVine.

Privacy invariant: confessions and votes are NEVER linked to the submitter's user_id.
The `users` table only stores Vine creators / admins for ownership and auth.
"""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String, Text, Integer, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint, Index
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    nickname: Mapped[str] = mapped_column(String(60), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Vine(Base):
    __tablename__ = "vines"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    creator_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    custom_branding: Mapped[dict] = mapped_column(JSON, default=dict)
    game_schedule_hour: Mapped[int] = mapped_column(Integer, default=20)  # UTC hour, 0-23, -1 disabled
    moderation_strictness: Mapped[str] = mapped_column(String(20), default="balanced")
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class Confession(Base):
    __tablename__ = "confessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    emoji: Mapped[str] = mapped_column(String(8), default="🌿")
    status: Mapped[str] = mapped_column(String(20), default="approved", index=True)  # pending/approved/rejected
    is_boosted: Mapped[bool] = mapped_column(Boolean, default=False)
    flag_reason: Mapped[str | None] = mapped_column(String(40), nullable=True)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, index=True)


class GameSession(Base):
    __tablename__ = "game_sessions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    game_type: Mapped[str] = mapped_column(String(30), nullable=False)  # would_you_rather / unpopular_opinion
    question: Mapped[str] = mapped_column(Text, nullable=False)
    option_a: Mapped[str] = mapped_column(Text, nullable=False)
    option_b: Mapped[str] = mapped_column(Text, nullable=False)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)


class GameVote(Base):
    """Aggregate vote counts only — never linked to a user."""
    __tablename__ = "game_votes"
    __table_args__ = (UniqueConstraint("game_session_id", "option", name="uq_game_option"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("game_sessions.id"), index=True)
    option: Mapped[str] = mapped_column(String(1), nullable=False)  # 'a' or 'b'
    count: Mapped[int] = mapped_column(Integer, default=0)


class GameVoterFingerprint(Base):
    """Hashed fingerprint to prevent double-voting in the same session, never reverses to user identity."""
    __tablename__ = "game_voter_fingerprints"
    __table_args__ = (UniqueConstraint("game_session_id", "fingerprint", name="uq_session_fp"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    game_session_id: Mapped[str] = mapped_column(String(36), ForeignKey("game_sessions.id"), index=True)
    fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)


class VineCard(Base):
    __tablename__ = "vine_cards"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    confession_id: Mapped[str] = mapped_column(String(36), ForeignKey("confessions.id"), index=True)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    image_path: Mapped[str] = mapped_column(String(255), nullable=False)
    caption: Mapped[str] = mapped_column(Text, default="")
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)


class ModerationLog(Base):
    """Logs flagged confessions WITHOUT submitter identity."""
    __tablename__ = "moderation_logs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vine_id: Mapped[str] = mapped_column(String(36), ForeignKey("vines.id"), index=True)
    content_excerpt: Mapped[str] = mapped_column(String(160), nullable=False)
    classification: Mapped[str] = mapped_column(String(40), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
