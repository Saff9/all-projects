# backend/app/core/status.py
# PURPOSE: Central runtime health + uptime tracker (read-only for API)

import time
from typing import Dict

class ProviderStatus:
    def __init__(self):
        self.started_at = time.time()
        self.stats: Dict[str, dict] = {}

    def _init(self, name: str):
        if name not in self.stats:
            self.stats[name] = {
                "ok": 0,
                "error": 0,
                "last_error": None,
                "last_ok": None,
            }

    def mark_ok(self, name: str):
        self._init(name)
        self.stats[name]["ok"] += 1
        self.stats[name]["last_ok"] = time.time()

    def mark_error(self, name: str, error: str = "error"):
        self._init(name)
        self.stats[name]["error"] += 1
        self.stats[name]["last_error"] = error

    def snapshot(self):
        result = {}
        for name, s in self.stats.items():
            total = s["ok"] + s["error"]
            uptime = (s["ok"] / total * 100) if total > 0 else 100.0

            if s["error"] == 0:
                state = "green"
            elif uptime >= 90:
                state = "orange"
            else:
                state = "red"

            result[name] = {
                "state": state,
                "uptime": round(uptime, 2),
                "last_error": s["last_error"],
            }
        return result


status = ProviderStatus()
