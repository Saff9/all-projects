from supabase import create_client
from utils import config

supabase = create_client(config.SUPABASE_URL, config.SUPABASE_KEY)

def save_query(query_text, all_responses, best_answer):
    # 1️⃣ Save main query
    query = supabase.table("queries").insert({
        "query_text": query_text,
        "best_answer": best_answer
    }).execute()
    query_id = query.data[0]["id"]

    # 2️⃣ Save individual responses
    for source, response in zip(["openai", "claude", "perplexity"], all_responses):
        supabase.table("responses").insert({
            "query_id": query_id,
            "source": source,
            "response_text": response
        }).execute()
    return query_id

def save_feedback(query_id, feedback_type):
    supabase.table("feedback").insert({
        "query_id": query_id,
        "feedback_type": feedback_type
    }).execute()
