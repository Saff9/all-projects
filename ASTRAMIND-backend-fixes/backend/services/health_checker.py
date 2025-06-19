#backend/app/services/health_checker.py
# backend/app/services/health_checker.py
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal
from app.models.status import SystemStatus
from app.db.session import engine

def record_health():
    db: Session = SessionLocal()

    # API is up if this runs
    db.add(SystemStatus(service="api", status="up"))

    # Database check
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db.add(SystemStatus(service="database", status="up"))
    except Exception:
        db.add(SystemStatus(service="database", status="down"))

    db.commit()
    db.close()
