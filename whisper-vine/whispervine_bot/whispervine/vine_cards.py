"""Vine Card image generation via Replicate (SDXL/Flux). Async."""
from __future__ import annotations
import asyncio
import logging
import replicate
from tenacity import retry, stop_after_attempt, wait_exponential
from .config import settings

logger = logging.getLogger(__name__)


def _build_prompt(confession_text: str) -> str:
    safe = (confession_text or "").strip().replace("\n", " ")[:380]
    return (
        "Graphic novel comic panel, noir mystery style, high contrast lighting, "
        "deep dark purple background and radioactive neon green accents, "
        "halftone shading, ink-on-paper texture. "
        "A single dramatic scene illustrating an anonymous whispered confession. "
        f'Speech bubble at the top contains the EXACT text in clean comic lettering: "{safe}". '
        "Bottom-right shows a small stylized 'WhisperVine' watermark in neon green. "
        "Cinematic, atmospheric, mysterious, eerie, magenta highlights. No real people. No logos beyond WhisperVine."
    )


@retry(stop=stop_after_attempt(2), wait=wait_exponential(multiplier=1, min=1, max=4))
async def _run(prompt: str) -> str:
    """Call Replicate asynchronously and return image URL string."""
    # replicate.async_run streams predictions. We'll call sync run in thread.
    def _sync_run() -> str:
        client = replicate.Client(api_token=settings.replicate_api_token)
        output = client.run(
            settings.replicate_model,
            input={
                "prompt": prompt,
                "negative_prompt": "real person, real face, photorealistic portrait, watermark text other than WhisperVine, signature, blurry, low quality",
                "width": 1024, "height": 1024,
                "num_inference_steps": 28, "guidance_scale": 7.5,
            },
        )
        # output may be list[FileOutput] or list[str]
        if isinstance(output, list) and output:
            first = output[0]
            return first if isinstance(first, str) else str(first)
        return str(output)
    return await asyncio.to_thread(_sync_run)


async def generate_vine_card(confession_text: str) -> str:
    """Returns a public image URL hosted by Replicate's CDN."""
    if not settings.replicate_api_token:
        raise RuntimeError("REPLICATE_API_TOKEN is not configured")
    prompt = _build_prompt(confession_text)
    url = await asyncio.wait_for(_run(prompt), timeout=120.0)
    logger.info("Generated vine card URL=%s…", url[:60])
    return url
