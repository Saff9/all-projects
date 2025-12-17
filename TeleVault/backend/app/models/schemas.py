from datetime import datetime
from typing import Optional, List, Union, Any, Dict
from sqlmodel import SQLModel, Field
from pydantic import BaseModel


class FolderBase(SQLModel):
    name: str = Field(index=True)
    parent_id: Optional[str] = Field(default=None, index=True)
    color: Optional[str] = Field(default="#0088cc")
    icon: Optional[str] = Field(default="folder")
    is_encrypted: bool = Field(default=True)


class Folder(FolderBase, table=True):
    __tablename__ = "folders"
    id: str = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class FileRecordBase(SQLModel):
    name: str = Field(index=True)
    size: int = Field(default=0)
    mime_type: str = Field(default="application/octet-stream")
    category: str = Field(default="other", index=True)
    parent_id: Optional[str] = Field(default=None, index=True)
    is_encrypted: bool = Field(default=True)
    is_favorite: bool = Field(default=False, index=True)
    is_trashed: bool = Field(default=False, index=True)
    sha256: Optional[str] = Field(default=None)
    telegram_channel_id: Optional[int] = Field(default=None)
    telegram_chat_id: Optional[str] = Field(default=None)
    chunk_count: int = Field(default=1)
    telegram_message_ids: str = Field(default="[]")  # JSON array string of message IDs
    chunks_json: str = Field(default="[]")  # Backwards compatibility JSON array


class FileRecord(FileRecordBase, table=True):
    __tablename__ = "files"
    id: str = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ChunkRecordBase(SQLModel):
    file_id: str = Field(index=True)
    chunk_index: int = Field(default=0, index=True)
    byte_size: int = Field(default=0)
    sha256_hash: Optional[str] = Field(default=None)
    telegram_message_id: Optional[int] = Field(default=None)
    telegram_chat_id: Optional[str] = Field(default=None)


class ChunkRecord(ChunkRecordBase, table=True):
    __tablename__ = "chunks"
    id: str = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class AppSettingsBase(SQLModel):
    master_salt_hex: Optional[str] = Field(default=None)
    master_hash_hex: Optional[str] = Field(default=None)
    master_password_salt_hex: Optional[str] = Field(default=None)
    master_password_hash: Optional[str] = Field(default=None)
    telegram_bot_token: Optional[str] = Field(default=None)
    telegram_chat_id: Optional[str] = Field(default=None)
    telegram_api_id: Optional[int] = Field(default=None)
    telegram_api_hash: Optional[str] = Field(default=None)
    telegram_phone: Optional[str] = Field(default=None)
    telegram_session_string: Optional[str] = Field(default=None)
    vault_channel_id: Optional[int] = Field(default=None)
    vault_channel_title: str = Field(default="🛡️ TeleVault [Encrypted Storage]")
    is_configured: bool = Field(default=False)
    theme: str = Field(default="auto")  # 'auto', 'light', 'dark', 'oled'
    auto_sync_enabled: bool = Field(default=True)


class AppSettings(AppSettingsBase, table=True):
    __tablename__ = "settings"
    id: int = Field(default=1, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class SyncWatcherBase(SQLModel):
    local_folder: str
    remote_folder_id: Optional[str] = Field(default=None)
    mode: str = Field(default="backup")  # 'backup' (local->tg) or 'two_way'
    wifi_only: bool = Field(default=True)
    charging_only: bool = Field(default=False)
    is_active: bool = Field(default=True)
    last_sync_at: Optional[datetime] = Field(default=None)


class SyncWatcher(SyncWatcherBase, table=True):
    __tablename__ = "sync_watchers"
    id: str = Field(primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# Backward compatibility aliases
SyncRuleBase = SyncWatcherBase
SyncRule = SyncWatcher


# Pydantic Request / Response schemas
class SaveChunkRequest(BaseModel):
    id: Optional[str] = None
    chunk_index: int = 0
    byte_size: int = 0
    sha256_hash: Optional[str] = None
    telegram_message_id: Optional[int] = None
    telegram_chat_id: Optional[str] = None


class SaveFileRecordRequest(BaseModel):
    id: str
    name: str
    size: int
    mime_type: Optional[str] = "application/octet-stream"
    category: Optional[str] = "other"
    parent_id: Optional[str] = None
    is_encrypted: Optional[bool] = True
    is_favorite: Optional[bool] = False
    is_trashed: Optional[bool] = False
    sha256: Optional[str] = None
    telegram_channel_id: Optional[int] = None
    telegram_chat_id: Optional[str] = None
    chunk_count: Optional[int] = 1
    telegram_message_ids: Optional[Union[List[int], str]] = None
    chunks_json: Optional[str] = None
    chunks: Optional[List[SaveChunkRequest]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class CreateFolderRequest(BaseModel):
    id: Optional[str] = None
    name: str
    parent_id: Optional[str] = None
    color: Optional[str] = "#0088cc"
    icon: Optional[str] = "folder"
    is_encrypted: Optional[bool] = True


class UpdateFolderRequest(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class UpdateFileRequest(BaseModel):
    name: Optional[str] = None
    parent_id: Optional[str] = None
    category: Optional[str] = None
    is_favorite: Optional[bool] = None
    is_trashed: Optional[bool] = None


class SetupMasterPasswordRequest(BaseModel):
    master_password: str
    salt_hex: Optional[str] = None


class UnlockRequest(BaseModel):
    master_password: str


class TelegramSendCodeRequest(BaseModel):
    api_id: int
    api_hash: str
    phone_number: str


class TelegramVerifyCodeRequest(BaseModel):
    phone_code: str
    phone_number: Optional[str] = None
    phone_code_hash: Optional[str] = None
    api_id: Optional[int] = None
    api_hash: Optional[str] = None
    password_2fa: Optional[str] = None


class TelegramBotLoginRequest(BaseModel):
    bot_token: str
    target_chat_id: Optional[str] = None
    api_id: Optional[int] = None
    api_hash: Optional[str] = None


class TelegramQRStartRequest(BaseModel):
    api_id: Optional[int] = None
    api_hash: Optional[str] = None


class CreateSyncWatcherRequest(BaseModel):
    id: Optional[str] = None
    local_folder: str
    remote_folder_id: Optional[str] = None
    mode: Optional[str] = "backup"
    wifi_only: Optional[bool] = True
    charging_only: Optional[bool] = False
    is_active: Optional[bool] = True


class SearchQuery(BaseModel):
    query: str
    category: Optional[str] = None
    parent_id: Optional[str] = None
    trashed: bool = False
