"""In-memory rate limiting per Telegram user (no DB persistence)."""
from __future__ import annotations
import time
from cachetools import TTLCache
from .config import settings

_cache: TTLCache = TTLCache(maxsize=200_000, ttl=60)


def allow(user_id: int) -> bool:
    now = time.time()
    key = str(user_id)
    bucket = _cache.get(key, [])
    bucket = [t for t in bucket if now - t < 60]
    if len(bucket) >= settings.rate_limit_per_min:
        return False
    bucket.append(now)
    _cache[key] = bucket
    return True
