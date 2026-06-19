"""
SQLAlchemy database models for Apex Smart
"""
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any

from sqlalchemy import (
    create_engine, Column, String, Text, Integer, Boolean, 
    DateTime, Float, ForeignKey, JSON, Table, event
)
from sqlalchemy.orm import declarative_base, relationship, Session
from sqlalchemy.sql import func

from src.core.security import encryption_manager

Base = declarative_base()

# ========== Association Tables ==========

conversation_files = Table(
    'conversation_files',
    Base.metadata,
    Column('conversation_id', String(36), ForeignKey('conversations.id', ondelete='CASCADE'), primary_key=True),
    Column('file_id', String(36), ForeignKey('files.id', ondelete='CASCADE'), primary_key=True),
    Column('attached_at', DateTime, default=datetime.utcnow)
)

message_attachments = Table(
    'message_attachments',
    Base.metadata,
    Column('message_id', String(36), ForeignKey('messages.id', ondelete='CASCADE'), primary_key=True),
    Column('file_id', String(36), ForeignKey('files.id', ondelete='CASCADE'), primary_key=True)
)


# ========== Models ==========

class Conversation(Base):
    """Chat conversation"""
    __tablename__ = 'conversations'
    
    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: str = Column(String(255), nullable=False, default='New Conversation')
    provider: str = Column(String(50), nullable=False)
    model: str = Column(String(100), nullable=False)
    system_prompt: Optional[str] = Column(Text, nullable=True)
    message_count: int = Column(Integer, default=0)
    is_pinned: bool = Column(Boolean, default=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")
    files = relationship("File", secondary=conversation_files, back_populates="conversations")
    memory_facts = relationship("MemoryFact", back_populates="conversation")
    
    def to_dict(self, include_messages: bool = False) -> Dict[str, Any]:
        """Convert to dictionary"""
        data: Dict[str, Any] = {
            'id': self.id,
            'title': self.title,
            'provider': self.provider,
            'model': self.model,
            'message_count': self.message_count,
            'is_pinned': self.is_pinned,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None,
        }
        if include_messages:
            data['messages'] = [msg.to_dict() for msg in self.messages]
        return data


class Message(Base):
    """Chat message"""
    __tablename__ = 'messages'
    
    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id: str = Column(String(36), ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    role: str = Column(String(20), nullable=False)  # system, user, assistant, tool
    content: str = Column(Text, nullable=False)
    meta_data: Optional[Dict[str, Any]] = Column("metadata", JSON, nullable=True)  # provider, model, usage, etc.
    tokens: Optional[int] = Column(Integer, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages", foreign_keys=[conversation_id])
    attachments = relationship("File", secondary=message_attachments, back_populates="messages")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'metadata': self.meta_data,
            'tokens': self.tokens,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
        }


class File(Base):
    """Uploaded file"""
    __tablename__ = 'files'
    
    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename: str = Column(String(255), nullable=False)
    original_name: str = Column(String(255), nullable=False)
    mime_type: str = Column(String(100), nullable=False)
    size: int = Column(Integer, nullable=False)
    status: str = Column(String(20), default='uploading')  # uploading, processing, ready, error
    extracted_text: Optional[str] = Column(Text, nullable=True)
    word_count: Optional[int] = Column(Integer, nullable=True)
    storage_path: str = Column(String(500), nullable=False)
    error_message: Optional[str] = Column(Text, nullable=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversations = relationship("Conversation", secondary=conversation_files, back_populates="files")
    messages = relationship("Message", secondary=message_attachments, back_populates="attachments")
    
    def to_dict(self, include_text: bool = False) -> Dict[str, Any]:
        """Convert to dictionary"""
        data: Dict[str, Any] = {
            'id': self.id,
            'filename': self.filename,
            'original_name': self.original_name,
            'mime_type': self.mime_type,
            'size': self.size,
            'status': self.status,
            'word_count': self.word_count,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
        }
        if include_text:
            data['extracted_text'] = self.extracted_text
        if self.error_message is not None:
            data['error_message'] = self.error_message
        return data


class UserSetting(Base):
    """User settings"""
    __tablename__ = 'user_settings'
    
    id: int = Column(Integer, primary_key=True, autoincrement=True)
    key: str = Column(String(100), unique=True, nullable=False)
    value: Dict[str, Any] = Column(JSON, nullable=False)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'key': self.key,
            'value': self.value,
            'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None,
        }


class ProviderConfig(Base):
    """AI provider configuration"""
    __tablename__ = 'provider_configs'
    
    provider_id: str = Column(String(50), primary_key=True)
    api_key_encrypted: Optional[str] = Column(Text, nullable=True)
    base_url: Optional[str] = Column(String(500), nullable=True)
    is_enabled: bool = Column(Boolean, default=True)
    model_preferences: Optional[Dict[str, Any]] = Column(JSON, nullable=True)  # Default models, temperature, etc.
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def get_api_key(self) -> Optional[str]:
        """Decrypt and return API key"""
        key_value = self.api_key_encrypted
        if key_value is None or (isinstance(key_value, str) and len(key_value) == 0):
            return None
        try:
            if isinstance(key_value, str):
                return encryption_manager.decrypt(key_value)
            return None
        except Exception:
            return None
    
    def set_api_key(self, api_key: str) -> None:
        """Encrypt and store API key"""
        if api_key:
            self.api_key_encrypted = encryption_manager.encrypt(api_key)
        else:
            self.api_key_encrypted = None
    
    def to_dict(self, mask_key: bool = True) -> Dict[str, Any]:
        """Convert to dictionary"""
        api_key = self.get_api_key()
        return {
            'provider_id': self.provider_id,
            'api_key': encryption_manager.mask_api_key(api_key) if mask_key and api_key else (api_key if not mask_key else None),
            'is_configured': api_key is not None and len(api_key) > 0,
            'base_url': self.base_url,
            'is_enabled': self.is_enabled,
            'model_preferences': self.model_preferences,
            'updated_at': self.updated_at.isoformat() if self.updated_at is not None else None,
        }


class MemoryFact(Base):
    """Learned facts about the user"""
    __tablename__ = 'memory_facts'
    
    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id: Optional[str] = Column(String(36), ForeignKey('conversations.id', ondelete='SET NULL'), nullable=True)
    category: str = Column(String(50), nullable=False)  # preference, fact, skill, goal
    content: str = Column(Text, nullable=False)
    confidence: float = Column(Float, default=1.0)
    is_active: bool = Column(Boolean, default=True)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="memory_facts")
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'category': self.category,
            'content': self.content,
            'confidence': self.confidence,
            'source_conversation': self.conversation_id,
            'created_at': self.created_at.isoformat() if self.created_at is not None else None,
        }


class SearchCache(Base):
    """Cached web search results"""
    __tablename__ = 'search_cache'
    
    id: str = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    query_hash: str = Column(String(64), unique=True, nullable=False)
    query_text: str = Column(Text, nullable=False)
    results: Dict[str, Any] = Column(JSON, nullable=False)
    result_count: Optional[int] = Column(Integer, nullable=True)
    expires_at: datetime = Column(DateTime, nullable=False)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'id': self.id,
            'query_text': self.query_text,
            'results': self.results,
            'result_count': self.result_count,
            'expires_at': self.expires_at.isoformat() if self.expires_at is not None else None,
        }


# ========== Database Engine & Session ==========

DATABASE_URL = "sqlite:///./data/genzsmart.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False
)


def init_db() -> None:
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Get database session"""
    db = Session(bind=engine)
    try:
        yield db
    finally:
        db.close()


# ========== Event Listeners ==========

@event.listens_for(Conversation, 'before_update')
def update_conversation_timestamp(mapper, connection, target):
    """Update timestamp on conversation update"""
    target.updated_at = datetime.utcnow()


@event.listens_for(Message, 'after_insert')
def increment_message_count(mapper, connection, target):
    """Increment conversation message count"""
    connection.execute(
        Conversation.__table__.update().
        where(Conversation.__table__.c.id == target.conversation_id).
        values(message_count=Conversation.__table__.c.message_count + 1)
    )
