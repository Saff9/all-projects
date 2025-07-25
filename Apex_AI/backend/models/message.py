# backend/models/message.py

from sqlalchemy import Column, Text, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from sqlalchemy.sql import func

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"))
    role = Column(String)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    model = Column(String)  # which LLM generated it

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
