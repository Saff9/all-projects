# backend/models/memory.py
from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from sqlalchemy.sql import func

class Memory(Base):
    __tablename__ = "memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    memory_type = Column(String)  # preference, profile, longterm, special
    value = Column(Text)

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
