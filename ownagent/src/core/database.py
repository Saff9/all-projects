"""
Database utilities and initialization
"""
import os
from contextlib import contextmanager
from typing import Generator

from sqlalchemy.orm import Session

from src.models.database import (
    engine, init_db, get_db, Conversation, Message, File,
    UserSetting, ProviderConfig, MemoryFact, SearchCache
)


__all__ = [
    'engine',
    'init_db',
    'get_db',
    'get_db_session',
    'Conversation',
    'Message',
    'File',
    'UserSetting',
    'ProviderConfig',
    'MemoryFact',
    'SearchCache',
]


@contextmanager
def get_db_session() -> Generator[Session, None, None]:
    """Context manager for database sessions"""
    db = Session(bind=engine)
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def ensure_data_directory() -> None:
    """Ensure the data directory exists"""
    data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'data')
    os.makedirs(data_dir, exist_ok=True)


def initialize_database() -> None:
    """Initialize the database (create tables)"""
    ensure_data_directory()
    init_db()
