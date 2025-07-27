# backend/schemas/conversation_schemas.py

from pydantic import BaseModel

class CreateConversationSchema(BaseModel):
    title: str = "New Chat"

class RenameConversationSchema(BaseModel):
    new_title: str
