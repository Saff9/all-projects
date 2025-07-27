# backend/schemas/chat_schemas.py

from pydantic import BaseModel

class ChatRequest(BaseModel):
    conversation_id: str
    user_message: str
    model: str     # g:llama3, hf:mistral, or:deepseek-chat, web:search
    reasoning_mode: bool = False  # optional reasoning toggle
