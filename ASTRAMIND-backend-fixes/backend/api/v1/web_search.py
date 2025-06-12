# backend/app/api/v1/web_search.py
"""
Web search endpoint with rate limiting and authentication.
Prevents abuse of web search functionality.
"""

from fastapi import APIRouter, Query, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps.auth import get_current_user
from app.db.session import get_db
from app.db.models import User
from services.web_search import web_search_scrape, web_search_fallback
from core.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/web-search", tags=["Web Search"])


@router.get(
    "",
    summary="Search the web",
    description="Search the web for information (requires authentication)",
)
async def search(
    request: Request,
    q: str = Query(
        ...,
        min_length=1,
        max_length=200,
        description="Search query",
    ),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Search the web and return results.
    
    Args:
        q: Search query (1-200 characters)
        user: Authenticated user
        db: Database session
    
    Returns:
        Search results from DuckDuckGo or fallback
    
    Raises:
        401: If user not authenticated
        429: If user exceeded daily quota
    """

    # Verify user has quota remaining
    if user.daily_used >= user.daily_quota:
        logger.warning(
            f"Search blocked - quota exceeded for {user.email}: "
            f"{user.daily_used}/{user.daily_quota}"
        )
        raise HTTPException(
            status_code=429,
            detail="Daily quota exceeded",
        )

    # Verify web search is enabled
    if not settings.ENABLE_WEB_SEARCH:
        logger.warning("Web search requested but disabled in settings")
        raise HTTPException(
            status_code=503,
            detail="Web search is currently disabled",
        )

    try:
        # Log search request
        logger.info(f"Web search by {user.email}: {q[:50]}")

        # Try primary method (web scraping)
        http_client = getattr(request.app.state, "http_client", None)
        try:
            results = await web_search_scrape(q, client=http_client)
        except Exception as e:
            logger.warning(f"Web scrape failed for query: {q}: {e}")
            results = []

        if results:
            return {
                "status": "success",
                "source": "scrape",
                "query": q,
                "results": results,
            }

        # Fallback if scraping fails
        results = web_search_fallback(q)

        return {
            "status": "success",
            "source": "fallback",
            "query": q,
            "results": results,
        }

    except Exception as e:
        logger.error(
            f"Web search error for {user.email} (query: {q}): {e}",
            exc_info=True,
        )

        return {
            "status": "error",
            "query": q,
            "results": [],
            "message": "Search temporarily unavailable",
        }
