"""
Simple per-user rate limiter
Prevents spam/flood attacks
"""

import time
from collections import defaultdict
from config import RATE_LIMIT_COUNT, RATE_LIMIT_SECONDS


class RateLimiter:
    def __init__(self):
        self.users = defaultdict(list)

    def allowed(self, user_id: int) -> bool:
        now = time.time()

        timestamps = self.users[user_id]

        # remove old timestamps
        self.users[user_id] = [
            t for t in timestamps if now - t < RATE_LIMIT_SECONDS
        ]

        if len(self.users[user_id]) >= RATE_LIMIT_COUNT:
            return False

        self.users[user_id].append(now)
        return True


rate_limiter = RateLimiter()
