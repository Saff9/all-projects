"""
Search API Routes
Provides web search functionality
"""
from typing import Optional, Literal
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from src.api.dependencies import get_db
from src.models.schemas import BaseResponse
from src.services.search import search_web, get_available_providers, get_search_provider, clear_search_cache, get_search_cache_stats

router = APIRouter(prefix="/api/v1/search", tags=["search"])


@router.post("", response_model=BaseResponse)
async def perform_search(
    query: str,
    provider: Optional[str] = Query(None, description="Search provider (serpapi, brave, duckduckgo)"),
    num_results: int = Query(10, ge=1, le=50, description="Number of results"),
    search_type: Literal["general", "news", "images"] = Query("general", description="Type of search"),
    use_cache: bool = Query(True, description="Use cached results if available")
):
    """
    Perform a web search
    
    - **query**: Search query string
    - **provider**: Search provider (auto-selected if not specified)
    - **num_results**: Number of results to return (1-50)
    - **search_type**: Type of search (general, news, images)
    - **use_cache**: Whether to use cached results
    """
    try:
        # Validate provider if specified
        if provider and provider not in get_available_providers():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid provider. Available: {', '.join(get_available_providers())}"
            )
        
        # Perform search
        response = await search_web(
            query=query,
            provider_id=provider,
            num_results=num_results,
            search_type=search_type,
            use_cache=use_cache
        )
        
        return BaseResponse(
            data=response.to_dict()
        )
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/providers", response_model=BaseResponse)
async def list_search_providers():
    """List available search providers and their status"""
    providers = []
    
    for provider_id in get_available_providers():
        provider = get_search_provider(provider_id)
        if provider:
            providers.append({
                "id": provider_id,
                "name": provider.provider_name,
                "available": provider.is_available()
            })
    
    return BaseResponse(
        data={"providers": providers}
    )


@router.get("/history", response_model=BaseResponse)
async def get_search_history(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Get recent search history
    
    Note: This returns cached search queries, not stored history
    """
    # Get cache stats and recent queries
    cache_stats = get_search_cache_stats()
    
    return BaseResponse(
        data={
            "cache_stats": cache_stats,
            "note": "Search history is based on cache. Persistent history not implemented."
        }
    )


@router.post("/cache/clear", response_model=BaseResponse)
async def clear_cache():
    """Clear the search cache"""
    clear_search_cache()
    return BaseResponse(
        message="Search cache cleared successfully"
    )


@router.get("/cache/stats", response_model=BaseResponse)
async def get_cache_statistics():
    """Get search cache statistics"""
    stats = get_search_cache_stats()
    return BaseResponse(data=stats)
