"""Two-stage moderation pipeline.

Stage 1: regex/keyword heuristic for obvious doxxing/spam/high-harm.
Stage 2: OpenRouter or Groq LLM context-aware classifier (3s timeout, fallback).

Optional: Perspective API toxicity score as an additional stage 1 signal.
"""
from __future__ import annotations
import re
import json
import asyncio
import logging
from typing import Literal

import httpx
from openai import AsyncOpenAI
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential

from .config import settings

logger = logging.getLogger(__name__)

Classification = Literal[
    "APPROVED",
    "FLAGGED_HARASSMENT",
    "FLAGGED_DOXXING",
    "FLAGGED_SPAM",
    "FLAGGED_NSFW",
]

# --- Stage 1 patterns ---
_DOXX = [
    re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b"),
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    re.compile(r"\b\d{1,5}\s+\w+\s+(street|st|road|rd|avenue|ave|blvd|lane|ln)\b", re.I),
    re.compile(r"\bssn[: ]+\d{3}[-\s]?\d{2}[-\s]?\d{4}\b", re.I),
]
_SPAM = [
    re.compile(r"https?://\S+"),
    re.compile(r"\b(buy\s+now|click\s+here|free\s+money|crypto\s+pump|telegram\.me/joinchat|t\.me/joinchat)\b", re.I),
]
_HIGH = [
    re.compile(r"\b(kill\s+(yourself|urself|themselves)|kys)\b", re.I),
    re.compile(r"\b(rape|child\s*porn|cp\s+link)\b", re.I),
]


def _stage1(content: str) -> Classification | None:
    if any(p.search(content) for p in _HIGH):
        return "FLAGGED_HARASSMENT"
    if sum(bool(p.search(content)) for p in _DOXX) >= 1:
        return "FLAGGED_DOXXING"
    if sum(bool(p.search(content)) for p in _SPAM) >= 2:
        return "FLAGGED_SPAM"
    return None


_SYSTEM = """You are WhisperVine's content moderator for an anonymous confessional app on Telegram.
Classify ONE confession into ONE of:
- APPROVED: ok to post (includes harmless dark humor, edgy jokes, sad personal venting, mild profanity, sarcasm, hot takes, controversial opinions about ideas/concepts)
- FLAGGED_HARASSMENT: targeted slurs, real threats, direct calls to violence against a person/group
- FLAGGED_DOXXING: identifying info about a real third party (name + location, phone, SSN, address, workplace + name)
- FLAGGED_SPAM: promotional content, scams, repeated unrelated links
- FLAGGED_NSFW: explicit sexual content, sexual content involving minors (always flag), graphic gore

CRITICAL:
1. Dark humor + sarcasm = APPROVED unless targeting a specific real person with malice.
2. Self-disclosure (depression, breakups, regret) = APPROVED — never flag.
3. Author's own suicidal feelings = APPROVED.
4. Crypto/clickbait/spam = FLAGGED_SPAM.
5. Be lenient with strong language and unpopular opinions.

Respond with ONLY a JSON object: {"classification":"APPROVED|FLAGGED_HARASSMENT|FLAGGED_DOXXING|FLAGGED_SPAM|FLAGGED_NSFW"}.

Examples:
"I secretly hate my job and fantasize about quitting every day." → {"classification":"APPROVED"}
"John Smith from 1234 Maple St cheats on his wife." → {"classification":"FLAGGED_DOXXING"}
"Buy crypto now! 100x t.me/joinchat/abc" → {"classification":"FLAGGED_SPAM"}
"All [slur] should die" → {"classification":"FLAGGED_HARASSMENT"}
"""


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=0.5, min=0.5, max=2))
async def _call_openrouter(text: str) -> str:
    client = AsyncOpenAI(api_key=settings.openrouter_api_key, base_url="https://openrouter.ai/api/v1")
    resp = await client.chat.completions.create(
        model=settings.openrouter_model,
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": f'Confession: """{text[:1500]}"""'},
        ],
        max_tokens=60,
        temperature=0.0,
    )
    return resp.choices[0].message.content or ""


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=0.5, min=0.5, max=2))
async def _call_groq(text: str) -> str:
    client = AsyncGroq(api_key=settings.groq_api_key)
    resp = await client.chat.completions.create(
        model=settings.groq_model,
        messages=[
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": f'Confession: """{text[:1500]}"""'},
        ],
        max_tokens=60,
        temperature=0.0,
    )
    return resp.choices[0].message.content or ""


async def _perspective_score(content: str) -> float | None:
    if not settings.perspective_api_key:
        return None
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            r = await client.post(
                "https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze",
                params={"key": settings.perspective_api_key},
                json={
                    "comment": {"text": content[:1500]},
                    "languages": ["en"],
                    "requestedAttributes": {"TOXICITY": {}},
                },
            )
            r.raise_for_status()
            return float(r.json()["attributeScores"]["TOXICITY"]["summaryScore"]["value"])
    except Exception as e:
        logger.warning("Perspective error: %s", e)
        return None


async def _llm(content: str) -> Classification:
    if settings.llm_provider == "groq":
        if not settings.groq_api_key:
            return "APPROVED"
        text = await _call_groq(content)
    else:
        if not settings.openrouter_api_key:
            return "APPROVED"
        text = await _call_openrouter(content)
    m = re.search(r"\{[^{}]*\"classification\"[^{}]*\}", text)
    if not m:
        return "APPROVED"
    try:
        cls = json.loads(m.group(0)).get("classification", "APPROVED").upper().strip()
        if cls in ("APPROVED", "FLAGGED_HARASSMENT", "FLAGGED_DOXXING", "FLAGGED_SPAM", "FLAGGED_NSFW"):
            return cls  # type: ignore
        return "APPROVED"
    except Exception:
        return "APPROVED"


async def classify(content: str, strictness: str = "balanced") -> Classification:
    s1 = _stage1(content)
    if s1 is not None:
        return s1
    # Optional Perspective check
    score = await _perspective_score(content)
    if score is not None:
        threshold = {"loose": 0.92, "balanced": 0.85, "strict": 0.7}.get(strictness, 0.85)
        if score >= threshold:
            return "FLAGGED_HARASSMENT"
    try:
        return await asyncio.wait_for(_llm(content), timeout=3.0)
    except asyncio.TimeoutError:
        logger.warning("LLM moderation timeout — fallback approve")
        return "APPROVED"
    except Exception as e:
        logger.exception("LLM moderation error: %s", e)
        return "APPROVED"
