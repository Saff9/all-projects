# backend/app/middleware/request_validation.py
"""
Request validation middleware.
Enforces Content-Type, size limits, and other constraints.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import HTTPException
from core.config import settings
import logging

logger = logging.getLogger(__name__)


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """
    Validate incoming requests before they reach handlers.
    """

    async def dispatch(self, request: Request, call_next):
        # Only validate POST/PUT requests
        if request.method not in ["POST", "PUT", "PATCH"]:
            return await call_next(request)

        # Check Content-Type
        content_type = request.headers.get("content-type", "")
        if not content_type.startswith("application/json"):
            if request.method == "POST":
                # Security: Safely extract client IP for logging
                client_ip = "unknown"
                if request.client and hasattr(request.client, 'host'):
                    client_ip = request.client.host
                else:
                    client_ip = request.headers.get("X-Forwarded-For", request.headers.get("X-Real-IP", "unknown"))

                logger.warning(
                    f"Invalid Content-Type: {content_type} from {client_ip}"
                )
                return JSONResponse(
                    status_code=415,
                    content={"error": "Content-Type must be application/json"},
                )

        # Check Content-Length header
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                if size > settings.MAX_REQUEST_SIZE_BYTES:
                    # Security: Safely extract client IP for logging
                    client_ip = "unknown"
                    if request.client and hasattr(request.client, 'host'):
                        client_ip = request.client.host
                    else:
                        client_ip = request.headers.get("X-Forwarded-For", request.headers.get("X-Real-IP", "unknown"))

                    logger.warning(
                        f"Request too large: {size} bytes from {client_ip}"
                    )
                    return JSONResponse(
                        status_code=413,
                        content={"error": "Payload too large"},
                    )
            except ValueError:
                pass

        return await call_next(request)
