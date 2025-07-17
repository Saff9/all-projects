from fastapi import APIRouter
from services import openai_client, claude_client, scraper_perplexity, aggregator
from utils import supabase_db

router = APIRouter(prefix="/ask", tags=["Ask"])

@router.post("/")
async def ask_query(data: dict):
    user_query = data.get("query")

    # 1. Fetch from multiple sources
    openai_resp = await openai_client.get_answer(user_query)
    claude_resp = await claude_client.get_answer(user_query)
    perplexity_resp = scraper_perplexity.scrape_answer(user_query)

    # 2. Aggregate best answer
    best_answer = aggregator.pick_best([openai_resp, claude_resp, perplexity_resp])

    # 3. Store in Supabase
    supabase_db.save_query(user_query, [openai_resp, claude_resp, perplexity_resp], best_answer)

    # 4. Return to frontend
    return {
        "best_answer": best_answer,
        "sources": {
            "openai": openai_resp,
            "claude": claude_resp,
            "perplexity": perplexity_resp
        }
    }
