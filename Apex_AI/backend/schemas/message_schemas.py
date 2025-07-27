# backend/schemas/message_schemas.py

from pydantic import BaseModel

class CreateMessageSchema(BaseModel):
    role: str   # "user" or "assistant"
    content: str
    model: str  # e.g. g:llama3, hf:mistral
