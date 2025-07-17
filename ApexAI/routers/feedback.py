from fastapi import APIRouter
from utils import supabase_db

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("/")
async def add_feedback(data: dict):
    query_id = data.get("query_id")
    feedback = data.get("feedback")  # 'up' or 'down'
    supabase_db.save_feedback(query_id, feedback)
    return {"status": "success", "message": "Feedback recorded"}
