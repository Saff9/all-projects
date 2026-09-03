"""Telegram Mini App authentication: validate WebApp initData via HMAC-SHA256."""
from __future__ import annotations
import hmac
import hashlib
import json
import time
from urllib.parse import parse_qsl
from typing import Optional

from ..config import settings


def validate_init_data(init_data: str, max_age_sec: int = 86400) -> Optional[dict]:
    """Returns parsed user dict if valid, else None.

    Per Telegram docs:
    https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    if not init_data:
        return None
    parsed = dict(parse_qsl(init_data, strict_parsing=False))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        return None
    auth_date = int(parsed.get("auth_date", 0))
    if auth_date == 0 or time.time() - auth_date > max_age_sec:
        return None

    data_check = "\n".join(f"{k}={parsed[k]}" for k in sorted(parsed.keys()))
    secret_key = hmac.new(b"WebAppData", settings.bot_token.encode(), hashlib.sha256).digest()
    expected_hash = hmac.new(secret_key, data_check.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected_hash, received_hash):
        return None
    user_json = parsed.get("user", "{}")
    try:
        user = json.loads(user_json)
    except Exception:
        return None
    return user
