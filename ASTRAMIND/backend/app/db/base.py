# backend/app/db/base.py

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """
    Base class for all ORM models.
    SQLAlchemy 2.0 style.
    """
    pass
