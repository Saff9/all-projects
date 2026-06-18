# Apex Smart - Database Schema

## Overview

This document defines the database schema for Apex Smart using SQLAlchemy ORM. The schema supports both SQLite (default) and PostgreSQL through SQLAlchemy's abstraction layer.

## Entity Relationship Diagram

```mermaid
erDiagram
    CONVERSATION ||--o{ MESSAGE : contains
    CONVERSATION ||--o{ CONVERSATION_FILE : has
    MESSAGE ||--o{ MESSAGE_ATTACHMENT : has
    FILE ||--o{ CONVERSATION_FILE : referenced_by
    FILE ||--o{ MESSAGE_ATTACHMENT : attached_to
    USER_SETTING ||--o{ PROVIDER_CONFIG : contains
    CONVERSATION ||--o{ MEMORY_FACT : generates

    CONVERSATION {
        string id PK
        string title
        string provider
        string model
        text system_prompt
        integer message_count
        boolean is_pinned
        datetime created_at
        datetime updated_at
    }

    MESSAGE {
        string id PK
        string conversation_id FK
        string role
        text content
        json metadata
        integer tokens
        datetime created_at
    }

    FILE {
        string id PK
        string filename
        string original_name
        string mime_type
        integer size
        string status
        text extracted_text
        integer word_count
        string storage_path
        datetime created_at
    }

    CONVERSATION_FILE {
        string conversation_id FK
        string file_id FK
        datetime attached_at
    }

    MESSAGE_ATTACHMENT {
        string message_id FK
        string file_id FK
    }

    USER_SETTING {
        string id PK
        string key
        json value
        datetime updated_at
    }

    PROVIDER_CONFIG {
        string provider_id PK
        string api_key_encrypted
        string base_url
        boolean is_enabled
        json model_preferences
        datetime updated_at
    }

    MEMORY_FACT {
        string id PK
        string conversation_id FK
        string category
        text content
        float confidence
        datetime created_at
    }
```

## Table Definitions

### 1. conversations

Stores chat conversation metadata.

```sql
CREATE TABLE conversations (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    system_prompt TEXT,
    message_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_conversations_pinned ON conversations(is_pinned, updated_at DESC);
```

**SQLAlchemy Model:**
```python
class Conversation(Base):
    __tablename__ = "conversations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, default="New Conversation")
    provider = Column(String(50), nullable=False)
    model = Column(String(100), nullable=False)
    system_prompt = Column(Text, nullable=True)
    message_count = Column(Integer, default=0)
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    files = relationship("File", secondary="conversation_files", back_populates="conversations")
```

### 2. messages

Stores individual messages within conversations.

```sql
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    metadata JSON,
    tokens INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

**SQLAlchemy Model:**
```python
class Message(Base):
    __tablename__ = "messages"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # system, user, assistant, tool
    content = Column(Text, nullable=False)
    metadata = Column(JSON, nullable=True)  # provider, model, usage, etc.
    tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    attachments = relationship("File", secondary="message_attachments", back_populates="messages")
```

### 3. files

Stores file metadata for uploaded documents.

```sql
CREATE TABLE files (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'ready', 'error')),
    extracted_text TEXT,
    word_count INTEGER,
    storage_path VARCHAR(500) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_files_status ON files(status);
CREATE INDEX idx_files_created ON files(created_at DESC);
```

**SQLAlchemy Model:**
```python
class File(Base):
    __tablename__ = "files"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String(255), nullable=False)
    original_name = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    status = Column(String(20), default="uploading")  # uploading, processing, ready, error
    extracted_text = Column(Text, nullable=True)
    word_count = Column(Integer, nullable=True)
    storage_path = Column(String(500), nullable=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversations = relationship("Conversation", secondary="conversation_files", back_populates="files")
    messages = relationship("Message", secondary="message_attachments", back_populates="attachments")
```

### 4. conversation_files

Junction table linking files to conversations.

```sql
CREATE TABLE conversation_files (
    conversation_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    attached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, file_id),
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);
```

**SQLAlchemy Model:**
```python
class ConversationFile(Base):
    __tablename__ = "conversation_files"
    
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), primary_key=True)
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), primary_key=True)
    attached_at = Column(DateTime, default=datetime.utcnow)
```

### 5. message_attachments

Junction table linking files to specific messages.

```sql
CREATE TABLE message_attachments (
    message_id VARCHAR(36) NOT NULL,
    file_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (message_id, file_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
);
```

**SQLAlchemy Model:**
```python
class MessageAttachment(Base):
    __tablename__ = "message_attachments"
    
    message_id = Column(String(36), ForeignKey("messages.id", ondelete="CASCADE"), primary_key=True)
    file_id = Column(String(36), ForeignKey("files.id", ondelete="CASCADE"), primary_key=True)
```

### 6. user_settings

Stores user preferences and application settings.

```sql
CREATE TABLE user_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Use SERIAL for PostgreSQL
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_settings_key ON user_settings(key);
```

**SQLAlchemy Model:**
```python
class UserSetting(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(JSON, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 7. provider_configs

Stores AI provider API configurations.

```sql
CREATE TABLE provider_configs (
    provider_id VARCHAR(50) PRIMARY KEY,
    api_key_encrypted TEXT,
    base_url VARCHAR(500),
    is_enabled BOOLEAN DEFAULT TRUE,
    model_preferences JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**SQLAlchemy Model:**
```python
class ProviderConfig(Base):
    __tablename__ = "provider_configs"
    
    provider_id = Column(String(50), primary_key=True)
    api_key_encrypted = Column(Text, nullable=True)
    base_url = Column(String(500), nullable=True)
    is_enabled = Column(Boolean, default=True)
    model_preferences = Column(JSON, nullable=True)  # Default models, temperature, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
```

### 8. memory_facts

Stores learned facts about the user for personalization.

```sql
CREATE TABLE memory_facts (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36),
    category VARCHAR(50) NOT NULL CHECK (category IN ('preference', 'fact', 'skill', 'goal')),
    content TEXT NOT NULL,
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_memory_category ON memory_facts(category, is_active);
CREATE INDEX idx_memory_confidence ON memory_facts(confidence DESC);
```

**SQLAlchemy Model:**
```python
class MemoryFact(Base):
    __tablename__ = "memory_facts"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="SET NULL"), nullable=True)
    category = Column(String(50), nullable=False)  # preference, fact, skill, goal
    content = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    conversation = relationship("Conversation")
```

### 9. search_cache

Caches web search results for performance.

```sql
CREATE TABLE search_cache (
    id VARCHAR(36) PRIMARY KEY,
    query_hash VARCHAR(64) UNIQUE NOT NULL,
    query_text TEXT NOT NULL,
    results JSON NOT NULL,
    result_count INTEGER,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_search_hash ON search_cache(query_hash);
CREATE INDEX idx_search_expires ON search_cache(expires_at);
```

**SQLAlchemy Model:**
```python
class SearchCache(Base):
    __tablename__ = "search_cache"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    query_hash = Column(String(64), unique=True, nullable=False)
    query_text = Column(Text, nullable=False)
    results = Column(JSON, nullable=False)
    result_count = Column(Integer, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
```

## Schema Migrations

### Alembic Configuration

```python
# alembic/env.py
from sqlalchemy import create_engine
from src.models.database import Base

config.set_main_option("sqlalchemy.url", DATABASE_URL)
target_metadata = Base.metadata
```

### Migration Scripts

**Initial Migration (001_initial.py):**
```python
"""Initial schema creation

Revision ID: 001
Revises: 
Create Date: 2026-01-31
"""

from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None

def upgrade():
    # Create all tables
    op.create_table('conversations', ...)
    op.create_table('messages', ...)
    op.create_table('files', ...)
    op.create_table('conversation_files', ...)
    op.create_table('message_attachments', ...)
    op.create_table('user_settings', ...)
    op.create_table('provider_configs', ...)
    op.create_table('memory_facts', ...)
    op.create_table('search_cache', ...)
    
    # Create indexes
    op.create_index('idx_conversations_updated', 'conversations', ['updated_at'])
    op.create_index('idx_messages_conversation', 'messages', ['conversation_id', 'created_at'])
    # ... more indexes

def downgrade():
    op.drop_table('search_cache')
    op.drop_table('memory_facts')
    op.drop_table('provider_configs')
    op.drop_table('user_settings')
    op.drop_table('message_attachments')
    op.drop_table('conversation_files')
    op.drop_table('files')
    op.drop_table('messages')
    op.drop_table('conversations')
```

## Database Connection

### Configuration

```python
# src/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./data/genzsmart.db"
    # For PostgreSQL: "postgresql://user:password@localhost/genzsmart"
    
    # Connection pool settings (PostgreSQL)
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    
    # SQLite specific
    SQLITE_WAL_MODE: bool = True  # Write-Ahead Logging for better concurrency
```

### Engine Setup

```python
# src/models/database.py
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from src.core.config import settings

# Create engine
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=False
    )
    
    # Enable WAL mode for SQLite
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, connection_record):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        echo=False
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Data Access Patterns

### Repository Pattern

```python
# src/repositories/conversation_repository.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from src.models.database import Conversation, Message

class ConversationRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, title: str, provider: str, model: str) -> Conversation:
        conversation = Conversation(
            title=title,
            provider=provider,
            model=model
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation
    
    def get_by_id(self, conversation_id: str) -> Conversation | None:
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
    
    def list_recent(self, limit: int = 20, offset: int = 0) -> list[Conversation]:
        return self.db.query(Conversation)\
            .order_by(desc(Conversation.is_pinned), desc(Conversation.updated_at))\
            .offset(offset)\
            .limit(limit)\
            .all()
    
    def update_message_count(self, conversation_id: str):
        count = self.db.query(Message)\
            .filter(Message.conversation_id == conversation_id)\
            .count()
        conversation = self.get_by_id(conversation_id)
        if conversation:
            conversation.message_count = count
            self.db.commit()
    
    def delete(self, conversation_id: str) -> bool:
        conversation = self.get_by_id(conversation_id)
        if conversation:
            self.db.delete(conversation)
            self.db.commit()
            return True
        return False
```

### Usage in Services

```python
# src/services/chat_service.py
from src.repositories.conversation_repository import ConversationRepository

class ChatService:
    def __init__(self, db: Session):
        self.conversation_repo = ConversationRepository(db)
    
    async def create_conversation(self, provider: str, model: str) -> Conversation:
        return self.conversation_repo.create(
            title="New Conversation",
            provider=provider,
            model=model
        )
```

## Data Retention & Cleanup

### Automatic Cleanup Tasks

```python
# src/tasks/cleanup.py
from datetime import datetime, timedelta
from sqlalchemy import delete

async def cleanup_old_search_cache(db: Session):
    """Remove expired search cache entries"""
    stmt = delete(SearchCache).where(SearchCache.expires_at < datetime.utcnow())
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount

async def cleanup_orphaned_files(db: Session, storage_path: str):
    """Remove files not linked to any conversation"""
    # Find files with no conversation associations
    orphaned = db.query(File).outerjoin(ConversationFile)\
        .filter(ConversationFile.file_id == None)\
        .all()
    
    for file in orphaned:
        # Delete from filesystem
        file_path = Path(storage_path) / file.storage_path
        if file_path.exists():
            file_path.unlink()
        
        # Delete from database
        db.delete(file)
    
    await db.commit()
    return len(orphaned)

async def archive_old_conversations(db: Session, days: int = 90):
    """Archive conversations older than specified days"""
    cutoff = datetime.utcnow() - timedelta(days=days)
    # Implementation depends on archiving strategy
    pass
```

## Backup Strategy

### SQLite Backup

```python
import shutil
from datetime import datetime

def backup_sqlite_db(source_path: str, backup_dir: str):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = f"{backup_dir}/genzsmart_backup_{timestamp}.db"
    shutil.copy2(source_path, backup_path)
    return backup_path
```

### PostgreSQL Backup

```bash
# pg_dump for PostgreSQL
pg_dump -U username -h localhost genzsmart > backup_$(date +%Y%m%d).sql
```

## Performance Optimization

### Indexes Summary

| Table | Index | Purpose |
|-------|-------|---------|
| conversations | updated_at | Fast sorting by recency |
| conversations | is_pinned + updated_at | Pinned items first |
| messages | conversation_id + created_at | Fast conversation loading |
| messages | created_at | Time-based queries |
| files | status | Filter by processing status |
| memory_facts | category + is_active | Active facts by category |
| search_cache | query_hash | Fast cache lookup |
| search_cache | expires_at | Cleanup expired entries |

### Query Optimization Tips

1. **Pagination**: Always use cursor-based pagination for messages
2. **Eager Loading**: Use `joinedload` for relationships to avoid N+1
3. **Batch Operations**: Use bulk inserts for multiple messages
4. **JSON Queries**: Use JSON operators for metadata filtering (PostgreSQL)
