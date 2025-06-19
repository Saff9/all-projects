# backend/app/services/key_pool.py

import time
from collections import defaultdict
from typing import Dict, List, Optional


class KeyState:
    def __init__(self, key: str):
        self.key = key
        self.used_today = 0
        self.cooldown_until: Optional[float] = None


class KeyPool:
    """
    In-memory key pool.
    Fast, simple, and effective for free-tier scale.
    """

    def __init__(self):
        self._keys: Dict[str, List[KeyState]] = defaultdict(list)

    def add_keys(self, provider: str, keys: List[str]):
        for key in keys:
            self._keys[provider].append(KeyState(key))

    def acquire(self, provider: str) -> Optional[KeyState]:
        now = time.time()
        candidates = [
            k for k in self._keys.get(provider, [])
            if k.cooldown_until is None or k.cooldown_until <= now
        ]
        if not candidates:
            return None

        # Least-used key wins
        return min(candidates, key=lambda k: k.used_today)

    def mark_used(self, provider: str, key: KeyState):
        key.used_today += 1

    def cooldown(self, provider: str, key: KeyState, seconds: int = 60):
        key.cooldown_until = time.time() + seconds
