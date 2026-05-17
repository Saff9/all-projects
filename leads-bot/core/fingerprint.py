"""
Prevent duplicate leads
Creates unique hash of each lead
"""

import hashlib


def create_fingerprint(name: str, phone: str, message: str) -> str:
    raw = f"{name}:{phone}:{message}"
    return hashlib.sha256(raw.encode()).hexdigest()
