"""
Lead scoring algorithm
Helps business prioritize hot leads
"""


def calculate_score(phone: str | None, email: str | None, message: str) -> int:
    score = 0

    if phone:
        score += 5

    if email:
        score += 3

    if len(message) > 20:
        score += 2

    return score
