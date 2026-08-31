"""Initial schema for WhisperVine.

Revision ID: 0001
Revises:
Create Date: 2026-02-01 00:00:00
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("telegram_id", sa.BigInteger(), primary_key=True),
        sa.Column("username", sa.String(64), nullable=True),
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "vines",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("creator_user_id", sa.BigInteger(), sa.ForeignKey("users.telegram_id"), index=True, nullable=False),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("chat_id", sa.BigInteger(), nullable=True, unique=True),
        sa.Column("is_premium", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("custom_branding", postgresql.JSONB(), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column("game_schedule_hour", sa.Integer(), nullable=False, server_default="20"),
        sa.Column("moderation_strictness", sa.String(20), nullable=False, server_default="balanced"),
        sa.Column("requires_approval", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "confessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("vine_id", sa.String(36), sa.ForeignKey("vines.id"), index=True, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("emoji", sa.String(8), nullable=False, server_default="🌿"),
        sa.Column("status", sa.String(20), nullable=False, server_default="approved"),
        sa.Column("is_boosted", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("flag_reason", sa.String(40), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        # NOTE: NO user_id column. Privacy invariant.
    )
    op.create_index("ix_confessions_status", "confessions", ["status"])
    op.create_index("ix_confessions_created_at", "confessions", ["created_at"])

    op.create_table(
        "game_sessions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("vine_id", sa.String(36), sa.ForeignKey("vines.id"), index=True, nullable=False),
        sa.Column("game_type", sa.String(30), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("option_a", sa.Text(), nullable=False),
        sa.Column("option_b", sa.Text(), nullable=False),
        sa.Column("start_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.create_index("ix_game_sessions_active", "game_sessions", ["is_active"])

    op.create_table(
        "game_votes",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("game_session_id", sa.String(36), sa.ForeignKey("game_sessions.id"), index=True, nullable=False),
        sa.Column("option", sa.String(1), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False, server_default="0"),
        sa.UniqueConstraint("game_session_id", "option", name="uq_game_option"),
    )

    op.create_table(
        "game_voter_fingerprints",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("game_session_id", sa.String(36), sa.ForeignKey("game_sessions.id"), index=True, nullable=False),
        sa.Column("fingerprint", sa.String(64), nullable=False),
        sa.UniqueConstraint("game_session_id", "fingerprint", name="uq_session_fp"),
    )

    op.create_table(
        "vine_cards",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("confession_id", sa.String(36), sa.ForeignKey("confessions.id"), index=True, nullable=False),
        sa.Column("vine_id", sa.String(36), sa.ForeignKey("vines.id"), index=True, nullable=False),
        sa.Column("image_url", sa.String(500), nullable=False),
        sa.Column("caption", sa.Text(), nullable=False, server_default=""),
        sa.Column("generated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    op.create_table(
        "moderation_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("vine_id", sa.String(36), sa.ForeignKey("vines.id"), index=True, nullable=False),
        sa.Column("content_excerpt", sa.String(160), nullable=False),
        sa.Column("classification", sa.String(40), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )


def downgrade() -> None:
    for t in (
        "moderation_logs",
        "vine_cards",
        "game_voter_fingerprints",
        "game_votes",
        "game_sessions",
        "confessions",
        "vines",
        "users",
    ):
        op.drop_table(t)
