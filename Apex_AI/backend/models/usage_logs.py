# backend/models/usage_logs.py

from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from sqlalchemy.sql import func

class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    action = Column(String)  # chat, search, login, etc.
    model_used = Column(String)

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
