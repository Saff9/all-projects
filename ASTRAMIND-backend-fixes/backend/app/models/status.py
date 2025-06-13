# backend/app/models/status.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base

class SystemStatus(Base):
    __tablename__ = "system_status"

    id = Column(Integer, primary_key=True, index=True)
    service = Column(String, index=True)  # api, database, ai
    status = Column(String)               # up, degraded, down
    created_at = Column(DateTime, default=datetime.utcnow)
