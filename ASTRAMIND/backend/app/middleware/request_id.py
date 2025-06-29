# backend/app/middleware/request_id.py 
"""
Request ID middleware for audit trails.
Injects unique ID into every request/response.
"""

import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """
    Inject unique request ID for tracing.
    """

    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        # Log request
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"[{request_id}]"
        )

        response = await call_next(request)

        # Add request ID to response header
        response.headers["X-Request-ID"] = request_id

        return response
