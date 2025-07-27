# backend/utils/rate_limit.py

import time

RATE_LIMIT = {}  # user_id -> [timestamps]

MAX_REQUESTS = 20        # allowed per minute
WINDOW_SECONDS = 60      # 1 minute

def check_rate_limit(user_id: str):
    now = time.time()

    if user_id not in RATE_LIMIT:
        RATE_LIMIT[user_id] = []

    RATE_LIMIT[user_id] = [t for t in RATE_LIMIT[user_id] if now - t < WINDOW_SECONDS]

    if len(RATE_LIMIT[user_id]) >= MAX_REQUESTS:
        return False  # rate limit exceeded

    RATE_LIMIT[user_id].append(now)
    return True
