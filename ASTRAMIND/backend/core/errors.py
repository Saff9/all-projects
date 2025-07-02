# backend/app/core/errors.py

from fastapi import HTTPException, status


class AppError(HTTPException):
    """
    Base application error.
    Used to ensure consistent error responses.
    """

    def __init__(self, status_code: int, message: str):
        super().__init__(
            status_code=status_code,
            detail={"error": message},
        )


class UnauthorizedError(AppError):
    def __init__(self, message: str = "Unauthorized"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, message)


class RateLimitError(AppError):
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(status.HTTP_429_TOO_MANY_REQUESTS, message)
