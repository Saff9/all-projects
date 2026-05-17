# core/validators.py
# ======================================
# Input validation (VERY IMPORTANT for security)

import re

PHONE_REGEX = r"^[0-9]{7,15}$"


def clean_text(text: str, max_length: int = 120) -> str:
    """
    Trim spaces + prevent very long spam messages
    """
    text = text.strip()
    return text[:max_length]


def is_valid_name(name: str) -> bool:
    return 2 <= len(name.strip()) <= 50


def is_valid_phone(phone: str) -> bool:
    return re.match(PHONE_REGEX, phone) is not None


def is_valid_requirement(req: str) -> bool:
    return 5 <= len(req.strip()) <= 300
