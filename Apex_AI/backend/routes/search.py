# backend/routes/search.py

from fastapi import APIRouter
from services.search_engine import run_search_query

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/")
async def search(q: str):
    return await run_search_query(q)
