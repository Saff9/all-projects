import asyncio
import json
import uuid
import urllib.request
from datetime import datetime
from typing import List, Optional, Union, Dict, Any

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from app.models.schemas import (
    Folder, FileRecord, AppSettings, ChunkRecord, SyncWatcher,
    SaveFileRecordRequest, SaveChunkRequest,
    CreateFolderRequest, UpdateFolderRequest, UpdateFileRequest,
    SetupMasterPasswordRequest, UnlockRequest,
    TelegramSendCodeRequest, TelegramVerifyCodeRequest,
    TelegramBotLoginRequest, TelegramQRStartRequest,
    CreateSyncWatcherRequest, SearchQuery
)
from app.db.vfs import VirtualFileSystem, engine
from app.core.crypto import derive_key, hash_master_password, generate_salt
from app.services.telegram_client import TelegramEngine

router = APIRouter()

_active_engines: dict = {}
_qr_sessions: dict = {}


def get_active_engine(
    session_str: Optional[str] = None,
    api_id: Optional[int] = None,
    api_hash: Optional[str] = None
) -> TelegramEngine:
    engine_inst = TelegramEngine.get_shared_instance()
    if session_str:
        engine_inst.session_str = session_str
    if api_id:
        engine_inst.api_id = api_id
    if api_hash:
        engine_inst.api_hash = api_hash
    return engine_inst


# =====================================================================
# 1. System Status & Cross-Browser Salt Sync
# =====================================================================

@router.get("/status")
def get_system_status():
    """
    Returns full system status including authentication setup, master salt for
    multi-device key derivation, Telegram connection details, and bot metadata.
    """
    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if not settings:
            settings = VirtualFileSystem.get_settings()

        has_salt = bool(settings.master_salt_hex or settings.master_password_salt_hex)
        salt_hex = settings.master_salt_hex or settings.master_password_salt_hex
        has_hash = bool(settings.master_hash_hex or settings.master_password_hash)
        hash_hex = settings.master_hash_hex or settings.master_password_hash
        
        is_bot = bool(settings.telegram_bot_token)
        is_connected = bool(settings.telegram_session_string or settings.telegram_bot_token)
        chat_id = settings.telegram_chat_id or (str(settings.vault_channel_id) if settings.vault_channel_id else None)

        bot_info = None
        if is_bot and settings.telegram_phone:
            bot_username = settings.telegram_phone.replace("bot:", "")
            bot_info = {
                "username": bot_username,
                "chat_id": chat_id,
                "is_active": True
            }

        return {
            "status": "online",
            "is_configured": bool(settings.is_configured),
            "has_password": has_hash,
            "salt_hex": salt_hex,
            "master_salt_hex": salt_hex,
            "master_hash_hex": hash_hex,
            "channel_title": settings.vault_channel_title or "🛡️ TeleVault [Encrypted Storage]",
            "telegram_connected": is_connected,
            "telegram_phone": settings.telegram_phone,
            "telegram_chat_id": chat_id,
            "bot_token_configured": is_bot,
            "bot_info": bot_info,
            "theme": settings.theme or "auto",
            "auto_sync_enabled": bool(settings.auto_sync_enabled)
        }


# =====================================================================
# 2. Authentication & Key Management Endpoints
# =====================================================================

@router.post("/auth/setup-password")
def setup_master_password(req: SetupMasterPasswordRequest):
    """
    Configures master password, generates/stores cryptographic salt,
    and computes verification hash for Zero-Knowledge multi-device unlock.
    """
    if not req.master_password or len(req.master_password.strip()) < 8:
        raise HTTPException(status_code=400, detail="Master password must be at least 8 characters.")

    with Session(engine) as session:
        settings = session.get(AppSettings, 1) or AppSettings(id=1)
        
        if req.salt_hex:
            try:
                salt = bytes.fromhex(req.salt_hex)
                salt_hex = req.salt_hex
            except Exception:
                salt = generate_salt()
                salt_hex = salt.hex()
        else:
            salt = generate_salt()
            salt_hex = salt.hex()

        password_hash = hash_master_password(req.master_password, salt)
        
        settings.master_salt_hex = salt_hex
        settings.master_password_salt_hex = salt_hex
        settings.master_hash_hex = password_hash
        settings.master_password_hash = password_hash
        settings.is_configured = True
        settings.updated_at = datetime.utcnow()

        session.add(settings)
        session.commit()

        return {
            "success": True,
            "salt_hex": salt_hex,
            "master_salt_hex": salt_hex,
            "master_hash_hex": password_hash
        }


@router.post("/auth/unlock")
def unlock_vault(req: UnlockRequest):
    """
    Validates the supplied master password against the stored verification hash
    using PBKDF2 key derivation and the synchronized master salt.
    """
    if not req.master_password:
        raise HTTPException(status_code=400, detail="Please enter your Master Password.")

    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        stored_hash = settings.master_hash_hex or (settings.master_password_hash if settings else None)
        stored_salt = settings.master_salt_hex or (settings.master_password_salt_hex if settings else None)

        if not settings or not stored_hash or not stored_salt:
            raise HTTPException(status_code=400, detail="Master password not configured yet.")
        
        try:
            salt = bytes.fromhex(stored_salt)
        except Exception:
            raise HTTPException(status_code=500, detail="Stored cryptographic salt is invalid.")

        computed_hash = hash_master_password(req.master_password, salt)
        if computed_hash != stored_hash:
            raise HTTPException(status_code=401, detail="Incorrect Master Password.")
        
        return {
            "success": True,
            "unlocked": True,
            "salt_hex": stored_salt,
            "master_salt_hex": stored_salt
        }


# =====================================================================
# 3. Virtual File System (VFS) Folders Endpoints
# =====================================================================

@router.get("/folders", response_model=List[Folder])
def list_folders(parent_id: Optional[str] = None, all: bool = False):
    """
    Retrieves folders from the VFS. Supports filtering by parent_id or returning all folders.
    """
    return VirtualFileSystem.get_folders(parent_id=parent_id, all_folders=all)


@router.get("/folders/{folder_id}", response_model=Folder)
def get_folder(folder_id: str):
    """
    Retrieves a single folder by its ID.
    """
    folder = VirtualFileSystem.get_folder(folder_id)
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found.")
    return folder


@router.post("/folders", response_model=Folder)
def create_folder(req: CreateFolderRequest):
    """
    Creates a new folder in the Virtual File System.
    """
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="Folder name is required.")
    return VirtualFileSystem.create_folder(
        name=req.name,
        parent_id=req.parent_id,
        color=req.color or "#0088cc",
        icon=req.icon or "folder",
        folder_id=req.id,
        is_encrypted=req.is_encrypted if req.is_encrypted is not None else True
    )


@router.patch("/folders/{folder_id}", response_model=Folder)
@router.put("/folders/{folder_id}", response_model=Folder)
def update_folder(folder_id: str, req: UpdateFolderRequest):
    """
    Renames or updates folder metadata.
    """
    updated = VirtualFileSystem.update_folder(
        folder_id=folder_id,
        name=req.name,
        parent_id=req.parent_id,
        color=req.color,
        icon=req.icon
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Folder not found.")
    return updated


@router.delete("/folders/{folder_id}")
def delete_folder(folder_id: str):
    """
    Deletes a folder and moves contained files to Trash.
    """
    deleted = VirtualFileSystem.delete_folder(folder_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Folder not found.")
    return {"success": True, "deleted": True, "folder_id": folder_id}


# =====================================================================
# 4. Virtual File System (VFS) Files Endpoints
# =====================================================================

@router.get("/files", response_model=List[FileRecord])
def list_files(
    parent_id: Optional[str] = None,
    category: Optional[str] = None,
    trashed: bool = False,
    is_trashed: Optional[bool] = None,
    favorite_only: bool = False,
    is_favorite: Optional[bool] = None,
    q: Optional[str] = None,
    search: Optional[str] = None
):
    """
    List files with optional filtering by folder parent_id, category, trash, favorites, and search.
    """
    is_trash_flag = is_trashed if is_trashed is not None else trashed
    is_fav_flag = is_favorite if is_favorite is not None else favorite_only
    search_q = q or search
    return VirtualFileSystem.get_files(
        parent_id=parent_id,
        category=category,
        trashed=is_trash_flag,
        favorite_only=is_fav_flag,
        search_query=search_q
    )


@router.get("/files/{file_id}", response_model=FileRecord)
def get_file(file_id: str):
    """
    Retrieves metadata for a specific file.
    """
    file_rec = VirtualFileSystem.get_file(file_id)
    if not file_rec:
        raise HTTPException(status_code=404, detail="File not found.")
    return file_rec


@router.post("/files/record", response_model=FileRecord)
def save_file_record(req: SaveFileRecordRequest):
    """
    Saves or updates a file record along with its chunks and Telegram message IDs.
    """
    # Normalize telegram message IDs
    msg_ids = req.telegram_message_ids
    if msg_ids is None and req.chunks_json:
        try:
            msg_ids = json.loads(req.chunks_json)
        except Exception:
            msg_ids = []
    
    if isinstance(msg_ids, list):
        msg_ids_json = json.dumps(msg_ids)
    elif isinstance(msg_ids, str):
        msg_ids_json = msg_ids
    else:
        msg_ids_json = "[]"

    # Prepare chunk models if provided
    chunk_records = None
    if req.chunks:
        chunk_records = []
        for c in req.chunks:
            chunk_records.append(ChunkRecord(
                id=c.id or f"chunk-{req.id}-{c.chunk_index}",
                file_id=req.id,
                chunk_index=c.chunk_index,
                byte_size=c.byte_size,
                sha256_hash=c.sha256_hash,
                telegram_message_id=c.telegram_message_id,
                telegram_chat_id=c.telegram_chat_id or req.telegram_chat_id
            ))

    record = FileRecord(
        id=req.id,
        name=req.name,
        size=req.size,
        mime_type=req.mime_type or "application/octet-stream",
        category=req.category or "other",
        parent_id=req.parent_id if req.parent_id else None,
        is_encrypted=req.is_encrypted if req.is_encrypted is not None else True,
        is_favorite=req.is_favorite if req.is_favorite is not None else False,
        is_trashed=req.is_trashed if req.is_trashed is not None else False,
        sha256=req.sha256,
        telegram_channel_id=req.telegram_channel_id,
        telegram_chat_id=req.telegram_chat_id or (str(req.telegram_channel_id) if req.telegram_channel_id else None),
        chunk_count=req.chunk_count or (len(req.chunks) if req.chunks else 1),
        telegram_message_ids=msg_ids_json,
        chunks_json=msg_ids_json,
        created_at=req.created_at or datetime.utcnow(),
        updated_at=req.updated_at or datetime.utcnow()
    )
    return VirtualFileSystem.add_file(record, chunks=chunk_records)


@router.patch("/files/{file_id}", response_model=FileRecord)
def update_file(file_id: str, req: UpdateFileRequest):
    """
    Updates file metadata (name, parent_id, category, favorite, trash).
    """
    updated = VirtualFileSystem.update_file(
        file_id=file_id,
        name=req.name,
        parent_id=req.parent_id,
        category=req.category,
        is_favorite=req.is_favorite,
        is_trashed=req.is_trashed
    )
    if not updated:
        raise HTTPException(status_code=404, detail="File not found.")
    return updated


# Favorite Toggle Endpoints (support both /files/{id}/favorite and /files/favorite/{id})
@router.post("/files/{file_id}/favorite")
@router.post("/files/favorite/{file_id}")
def toggle_favorite(file_id: str):
    """
    Toggles starred/favorite status for a file.
    """
    new_status = VirtualFileSystem.toggle_favorite(file_id)
    return {"file_id": file_id, "is_favorite": new_status, "success": True}


# Trash Endpoints (support both /files/{id}/trash and /files/trash/{id})
@router.post("/files/{file_id}/trash")
@router.post("/files/trash/{file_id}")
def move_to_trash(file_id: str):
    """
    Moves a file to Recycle Bin / Trash.
    """
    success = VirtualFileSystem.move_to_trash(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found.")
    return {"success": True, "trashed": True, "file_id": file_id}


# Restore Endpoints (support both /files/{id}/restore and /files/restore/{id})
@router.post("/files/{file_id}/restore")
@router.post("/files/restore/{file_id}")
def restore_from_trash(file_id: str):
    """
    Restores a file from Recycle Bin / Trash.
    """
    success = VirtualFileSystem.restore_from_trash(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found.")
    return {"success": True, "restored": True, "file_id": file_id}


# Permanent Delete Endpoints
@router.delete("/files/{file_id}/permanent")
@router.delete("/files/permanent/{file_id}")
@router.delete("/files/{file_id}")
def delete_permanently(file_id: str):
    """
    Permanently deletes a file record and its chunk records from the database.
    """
    success = VirtualFileSystem.delete_permanently(file_id)
    if not success:
        raise HTTPException(status_code=404, detail="File not found.")
    return {"success": True, "deleted": True, "file_id": file_id}


# Empty Trash Endpoint
@router.post("/files/empty-trash")
def empty_trash():
    """
    Permanently purges all trashed files and chunks from the database.
    """
    deleted_count = VirtualFileSystem.empty_trash()
    return {
        "success": True,
        "deleted_count": deleted_count,
        "message": f"Successfully deleted {deleted_count} files from trash."
    }


# Storage Statistics Endpoint
@router.get("/storage/stats")
def get_storage_stats():
    """
    Returns accurate byte and category counts across active files, favorites, and trash.
    """
    return VirtualFileSystem.get_storage_stats()


# Search Endpoint
@router.get("/search", response_model=List[FileRecord])
def search_files(q: str = Query(..., min_length=1), trashed: bool = False, category: Optional[str] = None):
    """
    Performs case-insensitive search on files.
    """
    return VirtualFileSystem.search_files(query=q, trashed=trashed, category=category)


# =====================================================================
# 5. Cross-Device Sync Watchers Endpoints
# =====================================================================

@router.get("/sync/watchers", response_model=List[SyncWatcher])
def list_sync_watchers():
    """
    Lists all local folder auto-sync watchers.
    """
    return VirtualFileSystem.get_sync_watchers()


@router.post("/sync/watchers", response_model=SyncWatcher)
def create_sync_watcher(req: CreateSyncWatcherRequest):
    """
    Registers a new folder sync watcher.
    """
    watcher = SyncWatcher(
        id=req.id or f"sync-{uuid.uuid4()}",
        local_folder=req.local_folder,
        remote_folder_id=req.remote_folder_id,
        mode=req.mode or "backup",
        wifi_only=req.wifi_only if req.wifi_only is not None else True,
        charging_only=req.charging_only if req.charging_only is not None else False,
        is_active=req.is_active if req.is_active is not None else True,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    return VirtualFileSystem.create_sync_watcher(watcher)


@router.delete("/sync/watchers/{watcher_id}")
def delete_sync_watcher(watcher_id: str):
    """
    Deletes a sync watcher rule.
    """
    deleted = VirtualFileSystem.delete_sync_watcher(watcher_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sync watcher not found.")
    return {"success": True, "deleted": True, "watcher_id": watcher_id}


# =====================================================================
# 6. Telegram Authentication & Upload/Download Endpoints
# =====================================================================

@router.post("/telegram/send-code")
async def send_code(req: TelegramSendCodeRequest):
    print(f"[TeleVault] send-code called: phone={req.phone_number}, api_id={req.api_id}")
    tg_engine = TelegramEngine()
    try:
        await tg_engine.init_client(req.api_id, req.api_hash)
        phone_code_hash = await tg_engine.send_code(req.phone_number)
        _active_engines[req.phone_number] = {
            "engine": tg_engine,
            "phone_code_hash": phone_code_hash,
            "api_id": req.api_id,
            "api_hash": req.api_hash
        }
        print(f"[TeleVault] Code sent successfully to {req.phone_number}, hash={phone_code_hash[:8]}...")
        return {
            "success": True,
            "phone_code_hash": phone_code_hash,
            "phone_number": req.phone_number,
            "api_id": req.api_id,
            "api_hash": req.api_hash
        }
    except Exception as e:
        err_msg = str(e)
        print(f"[TeleVault] send-code ERROR: {err_msg}")
        if "API_ID_INVALID" in err_msg:
            err_msg = "The Telegram API ID / API Hash entered is invalid. Please check credentials from my.telegram.org."
        elif "PHONE_NUMBER_INVALID" in err_msg:
            err_msg = "The phone number format is invalid. Please include the full international dial code."
        elif "FLOOD_WAIT" in err_msg:
            err_msg = "Telegram rate limit: Too many attempts. Please wait a few minutes before trying again."
        raise HTTPException(status_code=400, detail=err_msg)


@router.post("/telegram/verify-code")
async def verify_code(req: TelegramVerifyCodeRequest):
    phone_number = req.phone_number
    engine_data = None

    if phone_number and phone_number in _active_engines:
        engine_data = _active_engines[phone_number]
    elif _active_engines:
        phone_number, engine_data = list(_active_engines.items())[0]

    if not engine_data:
        if req.api_id and req.api_hash and req.phone_number and req.phone_code_hash:
            tg_engine = TelegramEngine()
            await tg_engine.init_client(req.api_id, req.api_hash)
            engine_data = {
                "engine": tg_engine,
                "phone_code_hash": req.phone_code_hash,
                "api_id": req.api_id,
                "api_hash": req.api_hash
            }
            phone_number = req.phone_number
        else:
            raise HTTPException(status_code=400, detail="No active login session found. Please click 'Send Login Code' again.")

    tg_engine = engine_data["engine"]
    phone_code_hash = req.phone_code_hash or engine_data["phone_code_hash"]

    try:
        session_str = await tg_engine.sign_in(
            phone=phone_number,
            code=req.phone_code,
            phone_code_hash=phone_code_hash,
            password_2fa=req.password_2fa
        )

        channel_id = await tg_engine.get_or_create_vault_channel()
        me = await tg_engine.client.get_me()

        with Session(engine) as session:
            settings = session.get(AppSettings, 1) or AppSettings(id=1)
            settings.telegram_api_id = engine_data["api_id"]
            settings.telegram_api_hash = engine_data["api_hash"]
            settings.telegram_phone = phone_number
            settings.telegram_session_string = session_str
            settings.vault_channel_id = channel_id
            settings.telegram_chat_id = str(channel_id) if channel_id else None
            settings.is_configured = True
            settings.updated_at = datetime.utcnow()

            session.add(settings)
            session.commit()

            channel_title = settings.vault_channel_title

        if phone_number in _active_engines:
            del _active_engines[phone_number]

        return {
            "success": True,
            "session_string": session_str,
            "channel_id": channel_id,
            "channel_title": channel_title,
            "user": {
                "firstName": getattr(me, 'first_name', '') or 'Telegram User',
                "username": getattr(me, 'username', '') or '',
                "id": getattr(me, 'id', 0)
            },
            "session_saved": True
        }
    except Exception as e:
        err_msg = str(e)
        print(f"[TeleVault] verify-code ERROR: {err_msg}")
        if "2FA_REQUIRED" in err_msg or "SessionPasswordNeeded" in err_msg or "PASSWORD_HASH_INVALID" in err_msg:
            if not req.password_2fa:
                raise HTTPException(status_code=400, detail="2FA_REQUIRED: Telegram Two-Step Verification password is required.")
            else:
                raise HTTPException(status_code=400, detail="Invalid 2FA password. Please re-enter your Telegram 2FA cloud password.")
        elif "PHONE_CODE_INVALID" in err_msg:
            err_msg = "Invalid verification code. Please check the 5-digit code in your Telegram app."
        elif "PHONE_CODE_EXPIRED" in err_msg:
            err_msg = "Verification code has expired. Please click back and request a new code."
        raise HTTPException(status_code=400, detail=err_msg)


@router.post("/telegram/bot-login")
async def bot_login(req: TelegramBotLoginRequest):
    api_id = req.api_id or 2040
    api_hash = req.api_hash or "b18441a1ff607e10a989891a5462e627"
    bot_token = req.bot_token.strip()

    if not bot_token:
        raise HTTPException(status_code=400, detail="Please enter a valid Telegram Bot Token from @BotFather.")

    tg_engine = TelegramEngine()
    try:
        await tg_engine.init_client(api_id, api_hash)
        me, session_str = await tg_engine.sign_in_bot(bot_token)
        bot_username = getattr(me, 'username', '') or getattr(me, 'first_name', '')

        channel_id = None
        if req.target_chat_id and req.target_chat_id.strip():
            try:
                channel_id = int(req.target_chat_id.strip())
            except ValueError:
                channel_id = req.target_chat_id.strip()

        if not channel_id:
            try:
                req_url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
                with urllib.request.urlopen(req_url, timeout=3) as response:
                    update_data = json.loads(response.read().decode())
                    if update_data.get("ok") and update_data.get("result"):
                        for upd in reversed(update_data["result"]):
                            msg = upd.get("message") or upd.get("channel_post") or upd.get("my_chat_member")
                            if msg and msg.get("chat"):
                                channel_id = msg["chat"]["id"]
                                break
            except Exception as upd_err:
                print(f"[TeleVault] getUpdates notice: {upd_err}")

        with Session(engine) as session:
            settings = session.get(AppSettings, 1) or AppSettings(id=1)
            settings.telegram_api_id = api_id
            settings.telegram_api_hash = api_hash
            settings.telegram_phone = f"bot:{bot_username}"
            settings.telegram_session_string = session_str
            settings.telegram_bot_token = bot_token
            if channel_id:
                try:
                    settings.vault_channel_id = int(channel_id)
                except Exception:
                    pass
                settings.telegram_chat_id = str(channel_id)
            settings.is_configured = True
            settings.updated_at = datetime.utcnow()

            session.add(settings)
            session.commit()
            channel_title = settings.vault_channel_title

        if channel_id:
            try:
                await tg_engine.send_bot_welcome(channel_id)
            except Exception as w_err:
                print(f"[TeleVault] send_bot_welcome notice: {w_err}")

        return {
            "success": True,
            "session_string": session_str,
            "channel_id": channel_id,
            "channel_title": channel_title,
            "user": {
                "firstName": getattr(me, 'first_name', '') or 'Telegram Storage Bot',
                "username": bot_username,
                "id": getattr(me, 'id', 0),
                "isBot": True
            }
        }
    except Exception as e:
        err_msg = str(e)
        print(f"[TeleVault] bot_login ERROR: {err_msg}")
        raise HTTPException(status_code=400, detail=f"Bot connection failed: {err_msg}")


async def _qr_background_listener(session_key: str, tg_engine: TelegramEngine, api_id: int, api_hash: str):
    try:
        user, session_str = await tg_engine.wait_qr_login(timeout=180.0)
        channel_id = await tg_engine.get_or_create_vault_channel()

        with Session(engine) as session:
            settings = session.get(AppSettings, 1) or AppSettings(id=1)
            settings.telegram_api_id = api_id
            settings.telegram_api_hash = api_hash
            settings.telegram_phone = getattr(user, 'phone', None) or f"user_{getattr(user, 'id', 'cloud')}"
            settings.telegram_session_string = session_str
            settings.vault_channel_id = channel_id
            settings.telegram_chat_id = str(channel_id) if channel_id else None
            settings.is_configured = True
            settings.updated_at = datetime.utcnow()

            session.add(settings)
            session.commit()
            channel_title = settings.vault_channel_title

        if session_key in _qr_sessions:
            _qr_sessions[session_key].update({
                "status": "success",
                "session_string": session_str,
                "channel_id": channel_id,
                "channel_title": channel_title,
                "user": {
                    "firstName": getattr(user, 'first_name', '') or 'Telegram User',
                    "username": getattr(user, 'username', '') or '',
                    "id": getattr(user, 'id', 0)
                }
            })
            print(f"[TeleVault] QR Login SUCCESS for user {user.id} ({getattr(user, 'first_name', '')})")
    except Exception as e:
        err_msg = str(e)
        print(f"[TeleVault] QR background listener notice: {err_msg}")
        if session_key in _qr_sessions:
            _qr_sessions[session_key].update({
                "status": "error",
                "error": err_msg
            })


@router.post("/telegram/qr-start")
async def qr_start(req: TelegramQRStartRequest):
    api_id = req.api_id or 2040
    api_hash = req.api_hash or "b18441a1ff607e10a989891a5462e627"

    tg_engine = TelegramEngine()
    try:
        await tg_engine.init_client(api_id, api_hash)
        qr_data = await tg_engine.start_qr_login()
        session_key = str(uuid.uuid4())
        _qr_sessions[session_key] = {
            "status": "pending",
            "engine": tg_engine,
            "api_id": api_id,
            "api_hash": api_hash
        }
        asyncio.create_task(_qr_background_listener(session_key, tg_engine, api_id, api_hash))

        return {
            "success": True,
            "session_key": session_key,
            "token_url": qr_data["token_url"],
            "expires": qr_data["expires"]
        }
    except Exception as e:
        err_msg = str(e)
        print(f"[TeleVault] qr_start ERROR: {err_msg}")
        raise HTTPException(status_code=400, detail=f"QR Code generation failed: {err_msg}")


@router.get("/telegram/qr-status")
def qr_status(session_key: str):
    if session_key not in _qr_sessions:
        return {"success": False, "status": "expired", "message": "QR session expired"}

    data = _qr_sessions[session_key]
    status = data.get("status", "pending")

    if status == "success":
        return {
            "success": True,
            "status": "success",
            "session_string": data.get("session_string"),
            "channel_id": data.get("channel_id"),
            "channel_title": data.get("channel_title"),
            "user": data.get("user", {})
        }
    elif status == "error":
        return {
            "success": False,
            "status": "error",
            "error": data.get("error", "QR Login Error")
        }

    return {"success": False, "status": "pending"}


@router.post("/telegram/qr-wait")
async def qr_wait(session_key: str = Form(...)):
    if session_key not in _qr_sessions:
        raise HTTPException(status_code=400, detail="QR session expired. Click Refresh to generate a new QR code.")

    data = _qr_sessions[session_key]
    if data.get("status") == "success":
        return {
            "success": True,
            "session_string": data.get("session_string"),
            "channel_id": data.get("channel_id"),
            "channel_title": data.get("channel_title"),
            "user": data.get("user")
        }

    return {"success": False, "status": "pending"}


@router.get("/telegram/status")
def get_telegram_status():
    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if not settings or (not settings.telegram_session_string and not settings.telegram_bot_token):
            return {"connected": False, "phone": None, "channel_title": None, "channel_id": None}
            
        return {
            "connected": True,
            "phone": settings.telegram_phone,
            "channel_title": settings.vault_channel_title,
            "channel_id": settings.vault_channel_id,
            "telegram_chat_id": settings.telegram_chat_id
        }


@router.post("/telegram/disconnect")
def disconnect_telegram():
    """
    Disconnects active Telegram session and clears credentials from settings.
    """
    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if settings:
            settings.telegram_session_string = None
            settings.telegram_phone = None
            settings.telegram_bot_token = None
            settings.vault_channel_id = None
            settings.telegram_chat_id = None
            settings.is_configured = False
            settings.updated_at = datetime.utcnow()
            session.add(settings)
            session.commit()
    return {"success": True, "disconnected": True}


@router.post("/files/upload-chunk")
async def upload_chunk(
    chunk: UploadFile = File(...),
    chunk_index: int = Form(0),
    total_chunks: int = Form(1),
    file_name: str = Form("chunk"),
    file_id: Optional[str] = Form(None)
):
    """
    Uploads an encrypted chunk to Telegram directly via MTProto and records chunk metadata.
    """
    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if not settings or (not settings.telegram_session_string and not settings.telegram_bot_token):
            raise HTTPException(status_code=401, detail="Telegram not connected. Complete setup first.")

        api_id = settings.telegram_api_id or 2040
        api_hash = settings.telegram_api_hash or "b18441a1ff607e10a989891a5462e627"
        tg = get_active_engine(
            session_str=settings.telegram_session_string,
            api_id=api_id,
            api_hash=api_hash
        )

        try:
            await tg.ensure_connected()

            target_channel = settings.vault_channel_id or (
                int(settings.telegram_chat_id)
                if settings.telegram_chat_id and settings.telegram_chat_id.lstrip("-").isdigit()
                else settings.telegram_chat_id
            )

            # Auto-discover chat_id if not known
            if not target_channel and settings.telegram_bot_token:
                discovered = tg.auto_discover_bot_chat_id(settings.telegram_bot_token)
                if discovered:
                    settings.vault_channel_id = discovered
                    settings.telegram_chat_id = str(discovered)
                    session.add(settings)
                    session.commit()
                    target_channel = discovered

            chunk_bytes = await chunk.read()
            chunk_name = f"{file_name}.chunk{chunk_index:04d}"
            msg_id = await tg.upload_encrypted_chunk(
                chunk_bytes=chunk_bytes,
                filename=chunk_name,
                channel_id=target_channel
            )

            # Persist chunk record if file_id is known
            if file_id:
                ch_rec = ChunkRecord(
                    id=f"chunk-{file_id}-{chunk_index}",
                    file_id=file_id,
                    chunk_index=chunk_index,
                    byte_size=len(chunk_bytes),
                    telegram_message_id=msg_id,
                    telegram_chat_id=str(target_channel) if target_channel else None
                )
                VirtualFileSystem.add_chunk(ch_rec)

            return {
                "success": True,
                "message_id": msg_id,
                "chunk_index": chunk_index,
                "byte_size": len(chunk_bytes)
            }
        except Exception as e:
            print(f"[TeleVault] upload_chunk ERROR: {e}")
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/files/download-chunk/{message_id}")
async def download_chunk_by_id(message_id: int):
    """
    Downloads a single binary chunk directly by Telegram message ID with stream headers.
    """
    from fastapi.responses import Response
    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if not settings or (not settings.telegram_session_string and not settings.telegram_bot_token):
            raise HTTPException(status_code=401, detail="Telegram not connected.")

        api_id = settings.telegram_api_id or 2040
        api_hash = settings.telegram_api_hash or "b18441a1ff607e10a989891a5462e627"
        tg = get_active_engine(
            session_str=settings.telegram_session_string,
            api_id=api_id,
            api_hash=api_hash
        )

        try:
            await tg.ensure_connected()
            target_channel = settings.vault_channel_id or (
                int(settings.telegram_chat_id)
                if settings.telegram_chat_id and settings.telegram_chat_id.lstrip("-").isdigit()
                else None
            )

            chunk_bytes = await tg.download_chunk(
                channel_id=target_channel,
                message_id=message_id
            )

            return Response(
                content=chunk_bytes,
                media_type="application/octet-stream",
                headers={
                    "Content-Disposition": f'inline; filename="chunk_{message_id}.bin"',
                    "Content-Length": str(len(chunk_bytes)),
                    "Accept-Ranges": "bytes"
                }
            )
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail=f"Chunk message {message_id} not found.")
        except Exception as e:
            print(f"[TeleVault] download_chunk_by_id ERROR: {e}")
            raise HTTPException(status_code=500, detail=str(e))


@router.get("/files/download")
async def download_file(name: Optional[str] = None, file_id: Optional[str] = None):
    """
    Downloads encrypted chunks from Telegram, reconstructs binary stream, and serves download.
    """
    import io

    with Session(engine) as session:
        settings = session.get(AppSettings, 1)
        if not settings or (not settings.telegram_session_string and not settings.telegram_bot_token):
            raise HTTPException(status_code=401, detail="Telegram not connected.")

        file_rec = None
        if file_id:
            file_rec = session.get(FileRecord, file_id)
        if not file_rec and name:
            file_rec = session.exec(select(FileRecord).where(FileRecord.name == name)).first()

        if not file_rec:
            raise HTTPException(status_code=404, detail="File not found in Virtual File System.")

        api_id = settings.telegram_api_id or 2040
        api_hash = settings.telegram_api_hash or "b18441a1ff607e10a989891a5462e627"
        tg = get_active_engine(
            session_str=settings.telegram_session_string,
            api_id=api_id,
            api_hash=api_hash
        )

        try:
            await tg.ensure_connected()

            raw_msg_ids = file_rec.telegram_message_ids or file_rec.chunks_json or "[]"
            try:
                chunk_ids = json.loads(raw_msg_ids)
            except Exception:
                chunk_ids = []

            # If chunk table has entries, sort by index
            chunks = session.exec(
                select(ChunkRecord)
                .where(ChunkRecord.file_id == file_rec.id)
                .order_by(ChunkRecord.chunk_index.asc())
            ).all()

            if chunks:
                chunk_ids = [c.telegram_message_id for c in chunks if c.telegram_message_id]

            target_channel = file_rec.telegram_channel_id or settings.vault_channel_id or (
                int(settings.telegram_chat_id)
                if settings.telegram_chat_id and settings.telegram_chat_id.lstrip("-").isdigit()
                else None
            )

            all_bytes = b""
            for msg_id in chunk_ids:
                chunk_data = await tg.download_chunk(
                    channel_id=target_channel,
                    message_id=msg_id
                )
                all_bytes += chunk_data

            return StreamingResponse(
                io.BytesIO(all_bytes),
                media_type=file_rec.mime_type or "application/octet-stream",
                headers={
                    "Content-Disposition": f'attachment; filename="{file_rec.name}"',
                    "Content-Length": str(len(all_bytes)),
                    "Accept-Ranges": "bytes"
                }
            )
        except Exception as e:
            print(f"[TeleVault] download ERROR: {e}")
            raise HTTPException(status_code=500, detail=str(e))

