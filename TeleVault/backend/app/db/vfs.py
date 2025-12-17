import os
import json
import uuid
import sqlite3
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
from sqlmodel import Session, create_engine, select, SQLModel, col, or_
from app.models.schemas import (
    Folder, FileRecord, AppSettings, ChunkRecord, SyncWatcher
)

DATABASE_URL = os.getenv("TELEVAULT_DB_URL", "sqlite:///./televault.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def _get_sqlite_db_path() -> str:
    if DATABASE_URL.startswith("sqlite:///"):
        path = DATABASE_URL.replace("sqlite:///", "")
        return os.path.abspath(path)
    return "televault.db"


def init_db():
    """
    Initializes SQLite Database schema and performs automatic schema & column migrations.
    Safely migrates legacy tables, adds missing columns, updates indexes, and seeds defaults.
    """
    db_path = _get_sqlite_db_path()
    
    # 1. Low-level schema introspection & legacy table migration
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        # Check existing tables
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        existing_tables = set(row[0] for row in cur.fetchall())

        # Table renames for legacy schema -> new schema
        table_migrations = {
            "appsettings": "settings",
            "filerecord": "files",
            "folder": "folders",
            "syncrule": "sync_watchers"
        }

        for old_t, new_t in table_migrations.items():
            if old_t in existing_tables and new_t not in existing_tables:
                print(f"[TeleVault DB Migration] Migrating table '{old_t}' -> '{new_t}'")
                cur.execute(f"ALTER TABLE {old_t} RENAME TO {new_t}")
                existing_tables.remove(old_t)
                existing_tables.add(new_t)

        conn.commit()
        conn.close()
    except Exception as mig_err:
        print(f"[TeleVault DB Migration] Pre-migration notice: {mig_err}")

    # 2. Ensure all tables exist according to SQLModel
    SQLModel.metadata.create_all(engine)

    # 3. Column-level migrations (add missing columns to existing tables)
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        required_columns = {
            "settings": {
                "master_salt_hex": "TEXT",
                "master_hash_hex": "TEXT",
                "master_password_salt_hex": "TEXT",
                "master_password_hash": "TEXT",
                "telegram_bot_token": "TEXT",
                "telegram_chat_id": "TEXT",
                "telegram_api_id": "INTEGER",
                "telegram_api_hash": "TEXT",
                "telegram_phone": "TEXT",
                "telegram_session_string": "TEXT",
                "vault_channel_id": "INTEGER",
                "vault_channel_title": "TEXT DEFAULT '🛡️ TeleVault [Encrypted Storage]'",
                "is_configured": "BOOLEAN DEFAULT 0",
                "theme": "TEXT DEFAULT 'auto'",
                "auto_sync_enabled": "BOOLEAN DEFAULT 1",
                "created_at": "TIMESTAMP",
                "updated_at": "TIMESTAMP"
            },
            "files": {
                "name": "TEXT",
                "size": "INTEGER DEFAULT 0",
                "mime_type": "TEXT DEFAULT 'application/octet-stream'",
                "category": "TEXT DEFAULT 'other'",
                "parent_id": "TEXT",
                "is_encrypted": "BOOLEAN DEFAULT 1",
                "is_favorite": "BOOLEAN DEFAULT 0",
                "is_trashed": "BOOLEAN DEFAULT 0",
                "sha256": "TEXT",
                "telegram_channel_id": "INTEGER",
                "telegram_chat_id": "TEXT",
                "chunk_count": "INTEGER DEFAULT 1",
                "telegram_message_ids": "TEXT DEFAULT '[]'",
                "chunks_json": "TEXT DEFAULT '[]'",
                "created_at": "TIMESTAMP",
                "updated_at": "TIMESTAMP"
            },
            "folders": {
                "name": "TEXT",
                "parent_id": "TEXT",
                "color": "TEXT DEFAULT '#0088cc'",
                "icon": "TEXT DEFAULT 'folder'",
                "is_encrypted": "BOOLEAN DEFAULT 1",
                "created_at": "TIMESTAMP",
                "updated_at": "TIMESTAMP"
            },
            "chunks": {
                "file_id": "TEXT",
                "chunk_index": "INTEGER DEFAULT 0",
                "byte_size": "INTEGER DEFAULT 0",
                "sha256_hash": "TEXT",
                "telegram_message_id": "INTEGER",
                "telegram_chat_id": "TEXT",
                "created_at": "TIMESTAMP",
                "updated_at": "TIMESTAMP"
            },
            "sync_watchers": {
                "local_folder": "TEXT",
                "remote_folder_id": "TEXT",
                "mode": "TEXT DEFAULT 'backup'",
                "wifi_only": "BOOLEAN DEFAULT 1",
                "charging_only": "BOOLEAN DEFAULT 0",
                "is_active": "BOOLEAN DEFAULT 1",
                "last_sync_at": "TIMESTAMP",
                "created_at": "TIMESTAMP",
                "updated_at": "TIMESTAMP"
            }
        }

        for tbl, cols in required_columns.items():
            cur.execute(f"PRAGMA table_info({tbl})")
            existing_cols = set(row[1] for row in cur.fetchall())
            for col_name, col_type in cols.items():
                if col_name not in existing_cols:
                    print(f"[TeleVault DB Migration] Adding missing column '{col_name}' ({col_type}) to table '{tbl}'")
                    cur.execute(f"ALTER TABLE {tbl} ADD COLUMN {col_name} {col_type}")

        # Data consistency synchronization
        try:
            # Sync salt/hash between aliases in settings
            cur.execute("""
                UPDATE settings
                SET master_salt_hex = master_password_salt_hex
                WHERE master_salt_hex IS NULL AND master_password_salt_hex IS NOT NULL
            """)
            cur.execute("""
                UPDATE settings
                SET master_hash_hex = master_password_hash
                WHERE master_hash_hex IS NULL AND master_password_hash IS NOT NULL
            """)
            cur.execute("""
                UPDATE settings
                SET master_password_salt_hex = master_salt_hex
                WHERE master_password_salt_hex IS NULL AND master_salt_hex IS NOT NULL
            """)
            cur.execute("""
                UPDATE settings
                SET master_password_hash = master_hash_hex
                WHERE master_password_hash IS NULL AND master_hash_hex IS NOT NULL
            """)
            cur.execute("""
                UPDATE settings
                SET telegram_chat_id = CAST(vault_channel_id AS TEXT)
                WHERE telegram_chat_id IS NULL AND vault_channel_id IS NOT NULL
            """)

            # Sync message IDs between telegram_message_ids and chunks_json in files
            cur.execute("""
                UPDATE files
                SET telegram_message_ids = chunks_json
                WHERE (telegram_message_ids IS NULL OR telegram_message_ids = '' OR telegram_message_ids = '[]')
                  AND (chunks_json IS NOT NULL AND chunks_json != '' AND chunks_json != '[]')
            """)
            cur.execute("""
                UPDATE files
                SET chunks_json = telegram_message_ids
                WHERE (chunks_json IS NULL OR chunks_json = '' OR chunks_json = '[]')
                  AND (telegram_message_ids IS NOT NULL AND telegram_message_ids != '' AND telegram_message_ids != '[]')
            """)
        except Exception as sync_err:
            print(f"[TeleVault DB Migration] Column data sync notice: {sync_err}")

        # Create indexes for optimal lookup performance
        indexes = [
            "CREATE INDEX IF NOT EXISTS ix_files_parent_id ON files (parent_id)",
            "CREATE INDEX IF NOT EXISTS ix_files_category ON files (category)",
            "CREATE INDEX IF NOT EXISTS ix_files_is_favorite ON files (is_favorite)",
            "CREATE INDEX IF NOT EXISTS ix_files_is_trashed ON files (is_trashed)",
            "CREATE INDEX IF NOT EXISTS ix_files_name ON files (name)",
            "CREATE INDEX IF NOT EXISTS ix_folders_parent_id ON folders (parent_id)",
            "CREATE INDEX IF NOT EXISTS ix_chunks_file_id ON chunks (file_id)",
            "CREATE INDEX IF NOT EXISTS ix_chunks_chunk_index ON chunks (chunk_index)",
        ]
        for idx in indexes:
            cur.execute(idx)

        conn.commit()
        conn.close()
    except Exception as col_err:
        print(f"[TeleVault DB Migration] Column check/index notice: {col_err}")

    # 4. Seed initial settings & default folders if not present
    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if not settings:
            now = datetime.utcnow()
            settings = AppSettings(
                id=1,
                vault_channel_title="🛡️ TeleVault [Encrypted Storage]",
                is_configured=False,
                theme="auto",
                auto_sync_enabled=True,
                created_at=now,
                updated_at=now
            )
            session.add(settings)
            session.commit()
            
        folders = session.exec(select(Folder)).all()
        if not folders:
            now = datetime.utcnow()
            defaults = [
                Folder(id="folder-media", name="Photos & Videos", parent_id=None, color="#2aabee", icon="image", is_encrypted=True, created_at=now, updated_at=now),
                Folder(id="folder-docs", name="Personal Documents", parent_id=None, color="#4fae4e", icon="file-text", is_encrypted=True, created_at=now, updated_at=now),
                Folder(id="folder-projects", name="Source Code & Archives", parent_id=None, color="#ab47bc", icon="code", is_encrypted=True, created_at=now, updated_at=now),
            ]
            for f in defaults:
                session.add(f)
            session.commit()


class VirtualFileSystem:
    """
    Virtual File System database access layer providing robust CRUD operations,
    cross-browser synchronization state, file metadata, and storage statistics.
    """

    @staticmethod
    def get_folders(parent_id: Optional[str] = None, all_folders: bool = False) -> List[Folder]:
        with Session(engine) as session:
            if all_folders:
                return session.exec(select(Folder).order_by(Folder.name.asc())).all()
            statement = select(Folder).where(Folder.parent_id == parent_id).order_by(Folder.name.asc())
            return session.exec(statement).all()

    @staticmethod
    def get_folder(folder_id: str) -> Optional[Folder]:
        with Session(engine) as session:
            return session.get(Folder, folder_id)

    @staticmethod
    def create_folder(
        name: str,
        parent_id: Optional[str] = None,
        color: str = "#0088cc",
        icon: str = "folder",
        folder_id: Optional[str] = None,
        is_encrypted: bool = True
    ) -> Folder:
        with Session(engine) as session:
            new_id = folder_id or f"folder-{uuid.uuid4()}"
            now = datetime.utcnow()
            new_folder = Folder(
                id=new_id,
                name=name.strip(),
                parent_id=parent_id if parent_id else None,
                color=color or "#0088cc",
                icon=icon or "folder",
                is_encrypted=is_encrypted,
                created_at=now,
                updated_at=now
            )
            session.add(new_folder)
            session.commit()
            session.refresh(new_folder)
            return new_folder

    @staticmethod
    def update_folder(
        folder_id: str,
        name: Optional[str] = None,
        parent_id: Optional[str] = None,
        color: Optional[str] = None,
        icon: Optional[str] = None
    ) -> Optional[Folder]:
        with Session(engine) as session:
            folder = session.get(Folder, folder_id)
            if not folder:
                return None
            if name is not None:
                folder.name = name.strip()
            if parent_id is not None:
                folder.parent_id = parent_id if parent_id != "" else None
            if color is not None:
                folder.color = color
            if icon is not None:
                folder.icon = icon
            folder.updated_at = datetime.utcnow()
            session.add(folder)
            session.commit()
            session.refresh(folder)
            return folder

    @staticmethod
    def delete_folder(folder_id: str) -> bool:
        with Session(engine) as session:
            folder = session.get(Folder, folder_id)
            if not folder:
                return False
            
            # Cascade: move all files in this folder to trash
            files_in_folder = session.exec(select(FileRecord).where(FileRecord.parent_id == folder_id)).all()
            for f in files_in_folder:
                f.is_trashed = True
                f.updated_at = datetime.utcnow()
                session.add(f)

            # Move subfolders or delete
            subfolders = session.exec(select(Folder).where(Folder.parent_id == folder_id)).all()
            for sf in subfolders:
                session.delete(sf)

            session.delete(folder)
            session.commit()
            return True

    @staticmethod
    def get_files(
        parent_id: Optional[str] = None,
        category: Optional[str] = None,
        trashed: bool = False,
        favorite_only: bool = False,
        search_query: Optional[str] = None
    ) -> List[FileRecord]:
        with Session(engine) as session:
            query = select(FileRecord).where(FileRecord.is_trashed == trashed)
            
            # Only filter by parent_id if we are browsing hierarchy and not searching or filtering by category/favorites
            if parent_id is not None and not category and not favorite_only and not search_query:
                query = query.where(FileRecord.parent_id == parent_id)
            elif parent_id == "" and not category and not favorite_only and not search_query:
                query = query.where(FileRecord.parent_id == None)

            if category and category != "all":
                query = query.where(FileRecord.category == category)
            if favorite_only:
                query = query.where(FileRecord.is_favorite == True)
            if search_query:
                pattern = f"%{search_query.lower()}%"
                query = query.where(FileRecord.name.ilike(pattern))

            return session.exec(query.order_by(FileRecord.created_at.desc())).all()

    @staticmethod
    def get_file(file_id: str) -> Optional[FileRecord]:
        with Session(engine) as session:
            return session.get(FileRecord, file_id)

    @staticmethod
    def get_file_by_name(name: str) -> Optional[FileRecord]:
        with Session(engine) as session:
            return session.exec(select(FileRecord).where(FileRecord.name == name)).first()

    @staticmethod
    def add_file(record: FileRecord, chunks: Optional[List[ChunkRecord]] = None) -> FileRecord:
        with Session(engine) as session:
            # Normalize message IDs format
            msg_ids_str = record.telegram_message_ids or record.chunks_json or "[]"
            if isinstance(msg_ids_str, list):
                msg_ids_str = json.dumps(msg_ids_str)
            record.telegram_message_ids = msg_ids_str
            record.chunks_json = msg_ids_str

            existing = session.get(FileRecord, record.id)
            if existing:
                existing.name = record.name
                existing.size = record.size
                existing.mime_type = record.mime_type
                existing.category = record.category
                existing.parent_id = record.parent_id
                existing.is_encrypted = record.is_encrypted
                existing.is_favorite = record.is_favorite
                existing.is_trashed = record.is_trashed
                existing.sha256 = record.sha256
                existing.telegram_channel_id = record.telegram_channel_id
                existing.telegram_chat_id = record.telegram_chat_id
                existing.chunk_count = record.chunk_count
                existing.telegram_message_ids = record.telegram_message_ids
                existing.chunks_json = record.chunks_json
                existing.updated_at = datetime.utcnow()
                session.add(existing)
                saved_record = existing
            else:
                if not record.created_at:
                    record.created_at = datetime.utcnow()
                record.updated_at = datetime.utcnow()
                session.add(record)
                saved_record = record

            # Add / replace chunk records if provided
            if chunks:
                # Remove existing chunks for this file
                old_chunks = session.exec(select(ChunkRecord).where(ChunkRecord.file_id == record.id)).all()
                for oc in old_chunks:
                    session.delete(oc)
                
                for ch in chunks:
                    if not ch.id:
                        ch.id = f"chunk-{record.id}-{ch.chunk_index}"
                    ch.file_id = record.id
                    if not ch.created_at:
                        ch.created_at = datetime.utcnow()
                    ch.updated_at = datetime.utcnow()
                    session.add(ch)

            session.commit()
            session.refresh(saved_record)
            return saved_record

    @staticmethod
    def update_file(
        file_id: str,
        name: Optional[str] = None,
        parent_id: Optional[str] = None,
        category: Optional[str] = None,
        is_favorite: Optional[bool] = None,
        is_trashed: Optional[bool] = None
    ) -> Optional[FileRecord]:
        with Session(engine) as session:
            file = session.get(FileRecord, file_id)
            if not file:
                return None
            if name is not None:
                file.name = name.strip()
            if parent_id is not None:
                file.parent_id = parent_id if parent_id != "" else None
            if category is not None:
                file.category = category
            if is_favorite is not None:
                file.is_favorite = is_favorite
            if is_trashed is not None:
                file.is_trashed = is_trashed
            file.updated_at = datetime.utcnow()
            session.add(file)
            session.commit()
            session.refresh(file)
            return file

    @staticmethod
    def toggle_favorite(file_id: str, is_favorite: Optional[bool] = None) -> bool:
        with Session(engine) as session:
            file = session.get(FileRecord, file_id)
            if file:
                if is_favorite is not None:
                    file.is_favorite = is_favorite
                else:
                    file.is_favorite = not file.is_favorite
                file.updated_at = datetime.utcnow()
                session.add(file)
                session.commit()
                return file.is_favorite
            return False

    @staticmethod
    def move_to_trash(file_id: str) -> bool:
        with Session(engine) as session:
            file = session.get(FileRecord, file_id)
            if file:
                file.is_trashed = True
                file.updated_at = datetime.utcnow()
                session.add(file)
                session.commit()
                return True
            return False

    @staticmethod
    def restore_from_trash(file_id: str) -> bool:
        with Session(engine) as session:
            file = session.get(FileRecord, file_id)
            if file:
                file.is_trashed = False
                file.updated_at = datetime.utcnow()
                session.add(file)
                session.commit()
                return True
            return False

    @staticmethod
    def delete_permanently(file_id: str) -> bool:
        with Session(engine) as session:
            file = session.get(FileRecord, file_id)
            if file:
                # Also delete associated chunk records
                chunks = session.exec(select(ChunkRecord).where(ChunkRecord.file_id == file_id)).all()
                for ch in chunks:
                    session.delete(ch)
                session.delete(file)
                session.commit()
                return True
            return False

    @staticmethod
    def empty_trash() -> int:
        with Session(engine) as session:
            trashed_files = session.exec(select(FileRecord).where(FileRecord.is_trashed == True)).all()
            count = len(trashed_files)
            for f in trashed_files:
                chunks = session.exec(select(ChunkRecord).where(ChunkRecord.file_id == f.id)).all()
                for ch in chunks:
                    session.delete(ch)
                session.delete(f)
            session.commit()
            return count

    @staticmethod
    def search_files(query: str, trashed: bool = False, category: Optional[str] = None) -> List[FileRecord]:
        with Session(engine) as session:
            like_pattern = f"%{query.lower()}%"
            stmt = select(FileRecord).where(
                FileRecord.is_trashed == trashed,
                FileRecord.name.ilike(like_pattern)
            )
            if category and category != "all":
                stmt = stmt.where(FileRecord.category == category)
            return session.exec(stmt.order_by(FileRecord.created_at.desc())).all()

    @staticmethod
    def get_storage_stats() -> Dict[str, Any]:
        with Session(engine) as session:
            all_files = session.exec(select(FileRecord)).all()
            active_files = [f for f in all_files if not f.is_trashed]
            trashed_files = [f for f in all_files if f.is_trashed]
            
            total_bytes = sum(f.size for f in active_files)
            file_count = len(active_files)
            favorites_count = sum(1 for f in active_files if f.is_favorite)
            trash_count = len(trashed_files)

            breakdown = {
                "all": total_bytes,
                "documents": 0,
                "images": 0,
                "videos": 0,
                "audio": 0,
                "archives": 0,
                "code": 0,
                "other": 0,
            }

            for f in active_files:
                cat = f.category.lower() if f.category else "other"
                if cat in breakdown:
                    breakdown[cat] += f.size
                else:
                    breakdown["other"] += f.size

            return {
                "total_bytes": total_bytes,
                "totalBytes": total_bytes,
                "file_count": file_count,
                "fileCount": file_count,
                "favorites_count": favorites_count,
                "favoritesCount": favorites_count,
                "trash_count": trash_count,
                "trashCount": trash_count,
                "breakdown": breakdown,
            }

    @staticmethod
    def get_chunks_for_file(file_id: str) -> List[ChunkRecord]:
        with Session(engine) as session:
            return session.exec(
                select(ChunkRecord)
                .where(ChunkRecord.file_id == file_id)
                .order_by(ChunkRecord.chunk_index.asc())
            ).all()

    @staticmethod
    def add_chunk(chunk: ChunkRecord) -> ChunkRecord:
        with Session(engine) as session:
            existing = session.get(ChunkRecord, chunk.id)
            if existing:
                existing.chunk_index = chunk.chunk_index
                existing.byte_size = chunk.byte_size
                existing.sha256_hash = chunk.sha256_hash
                existing.telegram_message_id = chunk.telegram_message_id
                existing.telegram_chat_id = chunk.telegram_chat_id
                existing.updated_at = datetime.utcnow()
                session.add(existing)
                session.commit()
                session.refresh(existing)
                return existing
            else:
                if not chunk.created_at:
                    chunk.created_at = datetime.utcnow()
                chunk.updated_at = datetime.utcnow()
                session.add(chunk)
                session.commit()
                session.refresh(chunk)
                return chunk

    @staticmethod
    def get_sync_watchers() -> List[SyncWatcher]:
        with Session(engine) as session:
            return session.exec(select(SyncWatcher).order_by(SyncWatcher.created_at.desc())).all()

    @staticmethod
    def create_sync_watcher(watcher: SyncWatcher) -> SyncWatcher:
        with Session(engine) as session:
            if not watcher.id:
                watcher.id = f"sync-{uuid.uuid4()}"
            if not watcher.created_at:
                watcher.created_at = datetime.utcnow()
            watcher.updated_at = datetime.utcnow()
            session.add(watcher)
            session.commit()
            session.refresh(watcher)
            return watcher

    @staticmethod
    def delete_sync_watcher(watcher_id: str) -> bool:
        with Session(engine) as session:
            w = session.get(SyncWatcher, watcher_id)
            if w:
                session.delete(w)
                session.commit()
                return True
            return False

    @staticmethod
    def get_settings() -> AppSettings:
        with Session(engine) as session:
            settings = session.get(AppSettings, 1)
            if not settings:
                now = datetime.utcnow()
                settings = AppSettings(
                    id=1,
                    vault_channel_title="🛡️ TeleVault [Encrypted Storage]",
                    is_configured=False,
                    theme="auto",
                    auto_sync_enabled=True,
                    created_at=now,
                    updated_at=now
                )
                session.add(settings)
                session.commit()
                session.refresh(settings)
            return settings

    @staticmethod
    def update_settings(**kwargs) -> AppSettings:
        with Session(engine) as session:
            settings = session.get(AppSettings, 1)
            if not settings:
                settings = AppSettings(id=1)

            for k, v in kwargs.items():
                if hasattr(settings, k):
                    setattr(settings, k, v)

            # Sync aliases
            if "master_salt_hex" in kwargs:
                settings.master_password_salt_hex = kwargs["master_salt_hex"]
            elif "master_password_salt_hex" in kwargs:
                settings.master_salt_hex = kwargs["master_password_salt_hex"]

            if "master_hash_hex" in kwargs:
                settings.master_password_hash = kwargs["master_hash_hex"]
            elif "master_password_hash" in kwargs:
                settings.master_hash_hex = kwargs["master_password_hash"]

            if "telegram_chat_id" in kwargs:
                try:
                    settings.vault_channel_id = int(kwargs["telegram_chat_id"])
                except Exception:
                    pass
            elif "vault_channel_id" in kwargs and kwargs["vault_channel_id"]:
                settings.telegram_chat_id = str(kwargs["vault_channel_id"])

            settings.updated_at = datetime.utcnow()
            session.add(settings)
            session.commit()
            session.refresh(settings)
            return settings


# Top-level helper function aliases
get_settings = VirtualFileSystem.get_settings
update_settings = VirtualFileSystem.update_settings
get_folders = VirtualFileSystem.get_folders
get_folder = VirtualFileSystem.get_folder
create_folder = VirtualFileSystem.create_folder
update_folder = VirtualFileSystem.update_folder
delete_folder = VirtualFileSystem.delete_folder
get_files = VirtualFileSystem.get_files
get_file = VirtualFileSystem.get_file
get_file_by_name = VirtualFileSystem.get_file_by_name
add_file = VirtualFileSystem.add_file
update_file = VirtualFileSystem.update_file
toggle_favorite = VirtualFileSystem.toggle_favorite
move_to_trash = VirtualFileSystem.move_to_trash
restore_from_trash = VirtualFileSystem.restore_from_trash
delete_permanently = VirtualFileSystem.delete_permanently
empty_trash = VirtualFileSystem.empty_trash
search_files = VirtualFileSystem.search_files
get_storage_stats = VirtualFileSystem.get_storage_stats
get_chunks_for_file = VirtualFileSystem.get_chunks_for_file
add_chunk = VirtualFileSystem.add_chunk
get_sync_watchers = VirtualFileSystem.get_sync_watchers
create_sync_watcher = VirtualFileSystem.create_sync_watcher
delete_sync_watcher = VirtualFileSystem.delete_sync_watcher

