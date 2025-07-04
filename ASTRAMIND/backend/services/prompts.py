# backend/app/services/prompts.py

MAX_PROMPT_LENGTH = 8_000  # characters


FORBIDDEN_PATTERNS = [
    "ignore previous instructions",
    "system prompt",
    "you are chatgpt",
    "developer message",
]


def sanitize_prompt(prompt: str) -> str:
    """
    Basic prompt hardening.
    This is NOT censorship — it prevents abuse.
    """

    if not prompt or not isinstance(prompt, str):
        raise ValueError("Invalid prompt")

    if len(prompt) > MAX_PROMPT_LENGTH:
        raise ValueError("Prompt too long")

    lowered = prompt.lower()
    for phrase in FORBIDDEN_PATTERNS:
        if phrase in lowered:
            raise ValueError("Prompt contains restricted instructions")

    return prompt.strip()
