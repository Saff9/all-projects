"""Vine Card image generation via Gemini Nano Banana (emergentintegrations).
Saves PNG to /app/backend/static/vine_cards/{uuid}.png and returns a relative path served at /api/cards/image/{uuid}.
"""
from __future__ import annotations
import os
import base64
import uuid
import logging
from pathlib import Path
from emergentintegrations.llm.chat import LlmChat, UserMessage

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
GEMINI_IMAGE_MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-3.1-flash-image-preview")

STATIC_DIR = Path(__file__).parent / "static" / "vine_cards"
STATIC_DIR.mkdir(parents=True, exist_ok=True)


def _build_prompt(confession_text: str) -> str:
    safe = (confession_text or "").strip().replace("\n", " ")
    safe = safe[:380]
    return (
        "Graphic novel comic panel, noir mystery style, high contrast lighting, "
        "deep dark purple background and radioactive neon green accents, "
        "halftone shading, ink-on-paper texture. "
        "A single dramatic scene illustrating an anonymous whispered confession. "
        f"Speech bubble at the top contains the EXACT text in clean comic lettering: \"{safe}\". "
        "Bottom-right shows a small stylized 'WhisperVine' watermark in neon green. "
        "Cinematic, atmospheric, mysterious, eerie, magenta highlights. No real people. No logos beyond WhisperVine."
    )


async def generate_vine_card(confession_text: str) -> tuple[str, str]:
    """Generate an image and return (filename, absolute_path)."""
    if not EMERGENT_LLM_KEY:
        raise RuntimeError("EMERGENT_LLM_KEY not configured")
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"card-{uuid.uuid4()}",
        system_message="You are a graphic novel illustrator for the WhisperVine anonymous confessional app.",
    ).with_model("gemini", GEMINI_IMAGE_MODEL).with_params(modalities=["image", "text"])

    prompt = _build_prompt(confession_text)
    _, images = await chat.send_message_multimodal_response(UserMessage(text=prompt))
    if not images:
        raise RuntimeError("Image generation returned no images")
    img = images[0]
    image_bytes = base64.b64decode(img["data"])
    # Detect format from magic bytes
    if image_bytes[:8] == b"\x89PNG\r\n\x1a\n":
        ext = "png"
    elif image_bytes[:3] == b"\xff\xd8\xff":
        ext = "jpg"
    elif image_bytes[8:12] == b"WEBP":
        ext = "webp"
    else:
        ext = "bin"
    fname = f"{uuid.uuid4()}.{ext}"
    fpath = STATIC_DIR / fname
    fpath.write_bytes(image_bytes)
    logger.info("Generated vine card %s (%d bytes)", fname, len(image_bytes))
    return fname, str(fpath)
