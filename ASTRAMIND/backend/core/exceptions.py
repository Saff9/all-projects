# backend/app/core/exceptions.py
"""
Global exception handlers and error definitions.
"""

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
import logging

logger = logging.getLogger(__name__)


class AppError(HTTPException):
    """
    Base application error.
    Used to ensure consistent error responses.
    """

    def __init__(self, status_code: int, message: str, detail: dict = None):
        super().__init__(
            status_code=status_code,
            detail=detail or {"error": message},
        )


class ValidationError(AppError):
    """User input validation failed."""

    def __init__(self, message: str):
        super().__init__(status.HTTP_400_BAD_REQUEST, message)


class UnauthorizedError(AppError):
    """Authentication failed."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(status.HTTP_401_UNAUTHORIZED, message)


class ForbiddenError(AppError):
    """Access denied."""

    def __init__(self, message: str = "Access denied"):
        super().__init__(status.HTTP_403_FORBIDDEN, message)


class RateLimitError(AppError):
    """Rate limit exceeded."""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(status.HTTP_429_TOO_MANY_REQUESTS, message)


class NotFoundError(AppError):
    """Resource not found."""

    def __init__(self, message: str = "Not found"):
        super().__init__(status.HTTP_404_NOT_FOUND, message)


class ServiceUnavailableError(AppError):
    """AI provider or service unavailable."""

    def __init__(self, message: str = "Service unavailable"):
        super().__init__(status.HTTP_503_SERVICE_UNAVAILABLE, message)


# ===== GLOBAL EXCEPTION HANDLER =====

async def global_exception_handler(request: Request, exc: Exception):
    """
    Handle unexpected exceptions.
    Logs error and returns safe response to client.
    """

    request_id = getattr(request.state, "request_id", "unknown")
    user_id = getattr(request.state, "user_id", "anonymous")

    # Database errors
    if isinstance(exc, IntegrityError):
        logger.error(
            f"Database integrity error [user: {user_id}, "
            f"request_id: {request_id}]",
            exc_info=exc,
        )
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "error": "Resource conflict",
                "request_id": request_id,
            },
        )

    if isinstance(exc, SQLAlchemyError):
        logger.error(
            f"Database error [user: {user_id}, request_id: {request_id}]",
            exc_info=exc,
        )
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "Database error",
                "request_id": request_id,
            },
        )

    # Timeout errors
    if isinstance(exc, TimeoutError):
        logger.warning(
            f"Request timeout [user: {user_id}, request_id: {request_id}]"
        )
        return JSONResponse(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            content={
                "error": "Request timeout",
                "request_id": request_id,
            },
        )

    # Unknown errors - log fully but return generic message
    logger.error(
        f"Unhandled exception [user: {user_id}, request_id: {request_id}] "
        f"{type(exc).__name__}: {str(exc)}",
        exc_info=exc,
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "request_id": request_id,
        },
    )


# ===== ERROR RESPONSE HELPERS =====

def error_response(
    status_code: int,
    message: str,
    request_id: str = "unknown",
) -> JSONResponse:
    """
    Create a standardized error response.
    """
    return JSONResponse(
        status_code=status_code,
        content={
            "error": message,
            "request_id": request_id,
        },
    )
