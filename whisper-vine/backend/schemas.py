"""Pydantic schemas (response & request models)."""
from __future__ import annotations
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# ---------- Auth ----------
class SignupRequest(BaseModel):
    email: EmailStr
    nickname: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserPublic"


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    email: str
    nickname: str
    is_admin: bool


# ---------- Vine ----------
class VineCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    description: str = Field(default="", max_length=600)
    moderation_strictness: Literal["loose", "balanced", "strict"] = "balanced"
    requires_approval: bool = False
    game_schedule_hour: int = Field(default=20, ge=-1, le=23)


class VineUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=80)
    description: Optional[str] = Field(default=None, max_length=600)
    moderation_strictness: Optional[Literal["loose", "balanced", "strict"]] = None
    requires_approval: Optional[bool] = None
    game_schedule_hour: Optional[int] = Field(default=None, ge=-1, le=23)
    custom_branding: Optional[dict] = None


class VinePublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    creator_user_id: str
    name: str
    slug: str
    description: str
    is_premium: bool
    moderation_strictness: str
    requires_approval: bool
    game_schedule_hour: int
    custom_branding: dict
    created_at: datetime


# ---------- Confession ----------
class ConfessionCreate(BaseModel):
    content: str = Field(min_length=2, max_length=1200)


class ConfessionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    vine_id: str
    content: str
    emoji: str
    status: str
    is_boosted: bool
    upvotes: int
    created_at: datetime


class ConfessionSubmitResponse(BaseModel):
    status: Literal["approved", "pending", "rejected"]
    confession: Optional[ConfessionPublic] = None
    message: str


# ---------- Games ----------
class GameSessionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    vine_id: str
    game_type: str
    question: str
    option_a: str
    option_b: str
    start_time: datetime
    end_time: datetime
    is_active: bool


class GameResults(BaseModel):
    game: GameSessionPublic
    votes_a: int
    votes_b: int
    pct_a: float
    pct_b: float
    has_voted: bool
    your_vote: Optional[str] = None


class VoteRequest(BaseModel):
    option: Literal["a", "b"]


# ---------- Vine Cards ----------
class VineCardPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    confession_id: str
    vine_id: str
    image_path: str
    caption: str
    generated_at: datetime


class GenerateCardRequest(BaseModel):
    confession_id: str


# ---------- Dashboard ----------
class DashboardStats(BaseModel):
    total_confessions: int
    pending_count: int
    approved_count: int
    rejected_count: int
    total_games: int
    total_cards: int
    confessions_today: int


TokenResponse.model_rebuild()
