"""LLM moderation pipeline.

Stage 1: Fast keyword/regex heuristic to catch obvious spam, doxxing, slur, and PII patterns.
Stage 2: Claude Sonnet 4.5 context-aware classification via emergentintegrations.
         3-second timeout. On timeout → fast heuristic fallback that approves benign content
         and flags only high-risk patterns.
Returned classifications: APPROVED | FLAGGED_HARASSMENT | FLAGGED_DOXXING | FLAGGED_SPAM | FLAGGED_NSFW.

Privacy: no submitter identity is ever passed to the LLM, only the message content.
"""
from __future__ import annotations
import os
import re
import json
import asyncio
import logging
import uuid
from typing import Literal

from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

Classification = Literal[
    "APPROVED",
    "FLAGGED_HARASSMENT",
    "FLAGGED_DOXXING",
    "FLAGGED_SPAM",
    "FLAGGED_NSFW",
]

LLM_MODEL = os.environ.get("LLM_MODEL_MODERATION", "claude-sonnet-4-5-20250929")
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# --- Stage 1: Quick heuristics ---
_DOXX_PATTERNS = [
    re.compile(r"\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b"),               # phone
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),  # email
    re.compile(r"\b\d{1,5}\s+\w+\s+(street|st|road|rd|avenue|ave|blvd|lane|ln)\b", re.I),
    re.compile(r"\bssn[: ]+\d{3}[-\s]?\d{2}[-\s]?\d{4}\b", re.I),
]
_SPAM_PATTERNS = [
    re.compile(r"https?://\S+"),
    re.compile(r"\b(buy\s+now|click\s+here|free\s+money|crypto\s+pump|telegram\.me/joinchat)\b", re.I),
]
_HIGH_HARM = [
    re.compile(r"\b(kill\s+(yourself|urself|themselves)|kys)\b", re.I),
    re.compile(r"\b(rape|child\s*porn|cp\s+link)\b", re.I),
]


def _stage1(content: str) -> Classification | None:
    """Returns a classification if Stage 1 is confident, else None to defer to LLM."""
    if any(p.search(content) for p in _HIGH_HARM):
        return "FLAGGED_HARASSMENT"
    if sum(bool(p.search(content)) for p in _DOXX_PATTERNS) >= 1:
        return "FLAGGED_DOXXING"
    if sum(bool(p.search(content)) for p in _SPAM_PATTERNS) >= 2:
        return "FLAGGED_SPAM"
    return None


# --- Stage 2: LLM classifier ---
_SYSTEM_PROMPT = """You are WhisperVine's content moderator for an anonymous confessional app.
Your job: classify a single confession message into ONE of:
- APPROVED: ok to post (includes harmless dark humor, edgy jokes, sad personal venting, mild profanity, sarcasm, hot takes, controversial opinions about ideas/concepts)
- FLAGGED_HARASSMENT: targeted slurs, real threats, direct calls to violence against a person/group, sustained bullying of a named individual
- FLAGGED_DOXXING: reveals identifying info about a real third party (full name + location, phone, SSN, address, workplace + name, doxxing intent)
- FLAGGED_SPAM: promotional content, scams, repeated unrelated links, advertising
- FLAGGED_NSFW: explicit sexual content, sexual content involving minors (always flag), graphic gore for shock value

CRITICAL RULES:
1. Dark humor, edgy jokes, and sarcasm are APPROVED unless they target a real specific person with malice.
2. Sad confessions about the author's own life (depression, breakups, regret) are APPROVED — never flag self-disclosure.
3. Mentioning suicide as the author's own feelings is APPROVED (offer support is not your job here).
4. Crypto/clickbait/spam links → FLAGGED_SPAM.
5. If a message reveals personal identifying info about a NAMED real third party → FLAGGED_DOXXING.
6. Be lenient with strong language and unpopular opinions — this is an anonymous confessional, not a clean room.

Respond with ONLY a JSON object, no prose:
{"classification": "APPROVED|FLAGGED_HARASSMENT|FLAGGED_DOXXING|FLAGGED_SPAM|FLAGGED_NSFW"}

Examples:
Input: "I secretly hate my job and fantasize about quitting every day."
Output: {"classification": "APPROVED"}

Input: "John Smith from 1234 Maple St works at Acme Corp and cheats on his wife."
Output: {"classification": "FLAGGED_DOXXING"}

Input: "Buy crypto now! 100x gains! t.me/joinchat/abc"
Output: {"classification": "FLAGGED_SPAM"}

Input: "All [slur] should die"
Output: {"classification": "FLAGGED_HARASSMENT"}

Input: "I'm in love with my best friend's partner and I don't know what to do."
Output: {"classification": "APPROVED"}

Input: "lol I forgot to feed my plant and now it's dead, am I a serial killer"
Output: {"classification": "APPROVED"}
"""


async def _classify_with_llm(content: str) -> Classification:
    if not EMERGENT_LLM_KEY:
        logger.warning("No EMERGENT_LLM_KEY; defaulting to APPROVED for benign-looking content")
        return "APPROVED"
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"mod-{uuid.uuid4()}",
        system_message=_SYSTEM_PROMPT,
    ).with_model("anthropic", LLM_MODEL)

    msg = UserMessage(text=f'Confession: """{content[:1500]}"""')
    raw = await chat.send_message(msg)
    text = raw if isinstance(raw, str) else str(raw)
    # Extract JSON object
    m = re.search(r"\{[^{}]*\"classification\"[^{}]*\}", text)
    if not m:
        logger.warning("Moderator returned non-JSON: %s", text[:200])
        return "APPROVED"
    try:
        data = json.loads(m.group(0))
        cls = data.get("classification", "APPROVED").upper().strip()
        if cls in ("APPROVED", "FLAGGED_HARASSMENT", "FLAGGED_DOXXING", "FLAGGED_SPAM", "FLAGGED_NSFW"):
            return cls  # type: ignore
        return "APPROVED"
    except Exception as e:
        logger.warning("Moderator JSON parse failed: %s", e)
        return "APPROVED"


async def classify(content: str, strictness: str = "balanced") -> Classification:
    """Two-stage moderation. 3s LLM timeout, fallback to heuristic-approve."""
    stage1 = _stage1(content)
    if stage1 is not None:
        return stage1
    try:
        return await asyncio.wait_for(_classify_with_llm(content), timeout=3.0)
    except asyncio.TimeoutError:
        logger.warning("LLM moderation timed out — fallback heuristic")
        # Fallback heuristic: approve unless very high risk pattern (already covered by stage1)
        return "APPROVED"
    except Exception as e:
        logger.exception("LLM moderation error: %s", e)
        return "APPROVED"
