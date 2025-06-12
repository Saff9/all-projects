# backend/app/api/v1/status.py
"""
Provider status endpoint.
Returns real-time uptime and health status of all AI providers.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.provider_status import ProviderStatus
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/status", tags=["Status"])


@router.get(
    "",
    summary="Get provider status",
    description="Returns uptime percentage and health status for all providers",
)
async def get_status(db: AsyncSession = Depends(get_db)):
    """
    Get real-time status of all AI providers.
    
    Returns:
        List of providers with status and uptime info
    """
    try:
        # Query all providers
        stmt = select(ProviderStatus)
        result = await db.execute(stmt)
        providers = result.scalars().all()

        # Format response
        return [
            {
                "provider": p.provider,
                "status": p.status,
                "uptime": round(p.uptime, 2),
                "last_checked": p.last_checked.isoformat() if p.last_checked else None,
            }
            for p in providers
        ]

    except Exception as e:
        logger.error(f"Error fetching provider status: {e}", exc_info=True)
        return []


@router.get(
    "/provider/{provider_name}",
    summary="Get specific provider status",
    description="Returns detailed status for a single provider",
)
async def get_provider_status(
    provider_name: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Get status of a specific provider.
    
    Args:
        provider_name: Name of provider (groq, openrouter, huggingface)
    
    Returns:
        Provider status or 404 if not found
    """
    try:
        stmt = select(ProviderStatus).where(
            ProviderStatus.provider == provider_name.lower()
        )
        result = await db.execute(stmt)
        provider = result.scalar_one_or_none()

        if not provider:
            return {"error": "Provider not found", "provider": provider_name}

        return {
            "provider": provider.provider,
            "status": provider.status,
            "uptime": round(provider.uptime, 2),
            "last_checked": provider.last_checked.isoformat() if provider.last_checked else None,
        }

    except Exception as e:
        logger.error(
            f"Error fetching status for {provider_name}: {e}",
            exc_info=True,
        )
        return {"error": "Internal server error"}
