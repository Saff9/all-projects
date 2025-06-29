# backend/app/middleware/rate_limit.py
"""
Redis-backed distributed rate limiting middleware with in-memory fallback.

- Sliding window using Redis Sorted Set for atomic counting per window.
- Keys are namespaced by scope and identifier (user_id if available, otherwise client IP).
- Sets response headers: X-RateLimit-Limit, X-RateLimit-Remaining, Retry-After on 429.
- Skips limits on health, readiness, and metrics endpoints.

Environment variables (optional):
- REDIS_URL: e.g., redis://localhost:6379/0
- RATE_LIMIT_PER_MINUTE: default 60
- RATE_LIMIT_WINDOW_SECONDS: default 60
"""

from __future__ import annotations

import os
import time
import asyncio
import logging
from typing import Optional, Tuple

from starlette.types import ASGIApp, Receive, Scope, Send
from starlette.responses import JSONResponse

try:
    from redis.asyncio import Redis
except Exception:  # pragma: no cover
    Redis = None  # type: ignore

logger = logging.getLogger(__name__)


class InMemoryLimiter:
    """Simple in-memory sliding window limiter for development use only."""

    def __init__(self, limit: int, window_sec: int):
        from collections import defaultdict, deque
        self.limit = limit
        self.window = window_sec
        self.buckets = defaultdict(lambda: deque())
        self._lock = asyncio.Lock()

    async def allow(self, key: str) -> Tuple[bool, int]:
        now = time.time()
        window_start = now - self.window
        async with self._lock:
            q = self.buckets[key]
            while q and q[0] < window_start:
                q.popleft()
            if len(q) < self.limit:
                q.append(now)
                remaining = self.limit - len(q)
                return True, remaining
            else:
                return False, 0


class RedisLimiter:
    """Redis sorted-set based sliding window limiter."""

    def __init__(self, client: Redis, limit: int, window_sec: int, namespace: str = "rl"):
        self.client = client
        self.limit = limit
        self.window = window_sec
        self.ns = namespace

    def _key(self, identifier: str) -> str:
        return f"{self.ns}:{identifier}:{self.window}:{self.limit}"

    async def allow(self, key: str) -> Tuple[bool, int]:
        now_ms = int(time.time() * 1000)
        window_ms = self.window * 1000
        redis_key = self._key(key)
        p = self.client.pipeline(transaction=True)
        # Add current request with score = timestamp, value = timestamp
        p.zadd(redis_key, {now_ms: now_ms})
        # Remove entries outside the window
        p.zremrangebyscore(redis_key, 0, now_ms - window_ms)
        # Count entries in window
        p.zcard(redis_key)
        # Expire the key after window to avoid leaks
        p.expire(redis_key, self.window)
        try:
            _, _, count, _ = await p.execute()
        except Exception as e:  # pragma: no cover
            logger.error(f"Redis limiter error: {e}")
            return True, self.limit  # fail open
        remaining = max(self.limit - int(count), 0)
        return (count <= self.limit), remaining


class RateLimitMiddleware:
    """ASGI middleware applying rate limits using Redis if available, else in-memory."""

    def __init__(self, app: ASGIApp):
        self.app = app
        self.limit = int(os.getenv("RATE_LIMIT_PER_MINUTE", os.getenv("RATE_LIMIT", "60")))
        self.window = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
        self.redis_url = os.getenv("REDIS_URL")
        self.skip_paths = {"/health", "/ready", "/metrics", "/docs", "/openapi.json", "/redoc"}
        self._limiter = None  # type: ignore

    async def _get_limiter(self):
        if self._limiter is not None:
            return self._limiter
        if self.redis_url and Redis is not None:
            try:
                client = Redis.from_url(self.redis_url, encoding="utf-8", decode_responses=True)
                # Test connection
                await client.ping()
                self._limiter = RedisLimiter(client, self.limit, self.window)
                logger.info("Rate limiter using Redis backend")
                return self._limiter
            except Exception as e:  # pragma: no cover
                logger.warning(f"Falling back to in-memory limiter, Redis error: {e}")
        self._limiter = InMemoryLimiter(self.limit, self.window)
        logger.info("Rate limiter using in-memory backend (development only)")
        return self._limiter

    def _client_ip(self, scope: Scope) -> str:
        headers = {k.decode().lower(): v.decode() for k, v in scope.get("headers", [])}
        xff = headers.get("x-forwarded-for")
        if xff:
            return xff.split(",")[0].strip()
        xri = headers.get("x-real-ip")
        if xri:
            return xri
        client = scope.get("client")
        if client:
            return client[0]
        return "unknown"

    def _identifier(self, scope: Scope) -> str:
        # Prefer user id when available; else IP address
        user_id = scope.get("user_id") or ""
        if user_id:
            return f"user:{user_id}"
        return f"ip:{self._client_ip(scope)}"

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")
        if any(path.startswith(p) for p in self.skip_paths):
            await self.app(scope, receive, send)
            return

        limiter = await self._get_limiter()
        identifier = self._identifier(scope)
        allowed, remaining = await limiter.allow(identifier)

        if not allowed:
            retry_after = str(self.window)
            resp = JSONResponse({
                "error": "Rate limit exceeded",
                "retry_after": self.window,
                "detail": f"Limit {self.limit}/{self.window}s"
            }, status_code=429)
            resp.headers["Retry-After"] = retry_after
            resp.headers["X-RateLimit-Limit"] = str(self.limit)
            resp.headers["X-RateLimit-Remaining"] = "0"
            await resp(scope, receive, send)
            return

        # Wrap send to inject headers
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                headers = message.setdefault("headers", [])
                headers.append((b"x-ratelimit-limit", str(self.limit).encode()))
                headers.append((b"x-ratelimit-remaining", str(remaining).encode()))
            await send(message)

        await self.app(scope, receive, send_wrapper)
