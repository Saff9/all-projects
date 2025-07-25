# backend/models/model_settings.py

from sqlalchemy import Column, String, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base
from sqlalchemy.sql import func

class ModelSettings(Base):
    __tablename__ = "model_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

    model_name = Column(String)  # e.g. g:llama3, hf:mistral
    mode = Column(String)        # default / reasoning / search

    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
