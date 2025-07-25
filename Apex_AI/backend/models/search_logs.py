# backend/models/search_logs.py

from sqlalchemy import Column, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from sqlalchemy.sql import func

class SearchLog(Base):
    __tablename__ = "search_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    query = Column(Text)
    results = Column(Text)  # JSON string

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
