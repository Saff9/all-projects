"""
All user input MUST pass through here
Never trust raw input
"""

import re
from config import MAX_TEXT_LENGTH


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.strip()
    text = text.replace("<", "").replace(">", "")
    text = text[:MAX_TEXT_LENGTH]

    return text


def clean_name(name: str) -> str | None:
    name = clean_text(name)

    if re.fullmatch(r"[A-Za-z ]{2,40}", name):
        return name

    return None


def clean_phone(phone: str) -> str | None:
    digits = re.sub(r"\D", "", phone)

    if 8 <= len(digits) <= 15:
        return digits

    return None


def clean_email(email: str) -> str | None:
    email = clean_text(email)

    if re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return email

    return None
