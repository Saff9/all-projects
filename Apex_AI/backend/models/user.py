# backend/models/user.py

from sqlalchemy import Column, String, TIMESTAMP, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, nullable=False)
    password_hash = Column(Text, nullable=False)

    role = Column(String, default="user")  # admin/user

    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
