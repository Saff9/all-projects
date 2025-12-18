import os
import io
import asyncio
import logging
import urllib.request
import json
from typing import Optional, Callable, List, AsyncGenerator, Union

from telethon import TelegramClient, functions, types, events, Button, errors
from telethon.sessions import StringSession

from app.core.config import settings

logger = logging.getLogger("televault.telegram")
logging.basicConfig(level=logging.INFO)


class TelegramEngine:
    """
    Core MTProto Engine managing Telethon client instances,
    bot automation, QR login, authentication, and high-performance chunk streaming.
    """
    _instance: Optional["TelegramEngine"] = None

    def __init__(self, session_str: Optional[str] = None):
        self.session_str = session_str
        self.client: Optional[TelegramClient] = None
        self.channel_id: Optional[Union[int, str]] = None
        self.api_id: int = settings.DEFAULT_API_ID
        self.api_hash: str = settings.DEFAULT_API_HASH
        self.bot_token: Optional[str] = None
        self._is_connecting: bool = False
        self._lock = asyncio.Lock()
        self.qr_login_obj = None

    @classmethod
    def get_shared_instance(cls) -> "TelegramEngine":
        if cls._instance is None:
            cls._instance = TelegramEngine()
        return cls._instance

    @property
    def is_connected(self) -> bool:
        return bool(self.client and self.client.is_connected())

    async def ensure_connected(self) -> TelegramClient:
        """
        Ensures the Telethon client is initialized and connected.
        Automatically reconnects if the connection dropped.
        """
        async with self._lock:
            if self.client and self.client.is_connected():
                return self.client

            if not self.client:
                session = StringSession(self.session_str or "")
                self.client = TelegramClient(
                    session,
                    self.api_id,
                    self.api_hash,
                    connection_retries=5,
                    retry_delay=1,
                    auto_reconnect=True,
                    timeout=30.0
                )

            if not self.client.is_connected():
                logger.info("[TeleVault] Connecting to Telegram MTProto...")
                await self.client.connect()
                logger.info("[TeleVault] Connected to Telegram MTProto.")

            return self.client

    async def init_client(self, api_id: int, api_hash: str, session_str: Optional[str] = None) -> TelegramClient:
        self.api_id = api_id
        self.api_hash = api_hash
        if session_str is not None:
            self.session_str = session_str
        return await self.ensure_connected()

    # ==========================================
    # Phone Authentication Pipeline
    # ==========================================

    async def send_code(self, phone: str, force_sms: bool = False) -> str:
        await self.ensure_connected()
        try:
            res = await self.client.send_code_request(phone, force_sms=force_sms)
            code_type = type(res.type).__name__
            logger.info(f"[TeleVault] Code sent via {code_type}, hash={res.phone_code_hash[:8]}...")
            return res.phone_code_hash
        except errors.FloodWaitError as fwe:
            logger.warning(f"[TeleVault] Flood wait error: {fwe.seconds}s required.")
            raise RuntimeError(f"Telegram rate limit: Please wait {fwe.seconds} seconds before requesting a code.")
        except Exception as e:
            logger.error(f"[TeleVault] send_code failed: {e}")
            raise

    async def sign_in(
        self,
        phone: str,
        code: str,
        phone_code_hash: str,
        password_2fa: Optional[str] = None
    ) -> str:
        await self.ensure_connected()
        try:
            await self.client.sign_in(phone=phone, code=code, phone_code_hash=phone_code_hash)
        except errors.SessionPasswordNeededError:
            if not password_2fa:
                raise ValueError("2FA_REQUIRED")
            await self.client.sign_in(password=password_2fa)
        except errors.FloodWaitError as fwe:
            raise RuntimeError(f"Telegram rate limit: Please wait {fwe.seconds} seconds.")
        except Exception as e:
            if "2FA" in str(e) or "SessionPasswordNeeded" in str(e) or "PASSWORD_HASH_INVALID" in str(e):
                if not password_2fa:
                    raise ValueError("2FA_REQUIRED")
                await self.client.sign_in(password=password_2fa)
            else:
                raise e

        # Export session string for persistence
        self.session_str = self.client.session.save()
        return self.session_str

    # ==========================================
    # QR Code Authentication Pipeline
    # ==========================================

    async def start_qr_login(self) -> dict:
        await self.ensure_connected()
        self.qr_login_obj = await self.client.qr_login()
        expires_ts = None
        if hasattr(self.qr_login_obj, 'expires') and self.qr_login_obj.expires:
            expires_ts = (
                self.qr_login_obj.expires.timestamp()
                if hasattr(self.qr_login_obj.expires, 'timestamp')
                else int(self.qr_login_obj.expires)
            )
        return {
            "token_url": self.qr_login_obj.url,
            "expires": expires_ts
        }

    async def wait_qr_login(self, timeout: float = 60.0):
        if not self.qr_login_obj:
            raise RuntimeError("QR login not started.")
        user = await self.qr_login_obj.wait(timeout=timeout)
        self.session_str = self.client.session.save()
        return user, self.session_str

    # ==========================================
    # Bot Token Authentication & Interactive Engine
    # ==========================================

    async def sign_in_bot(self, bot_token: str):
        self.bot_token = bot_token.strip()
        await self.ensure_connected()
        try:
            await self.client.start(bot_token=self.bot_token)
            me = await self.client.get_me()
            self.session_str = self.client.session.save()
            self.attach_bot_event_handlers()
            logger.info(f"[TeleVault] Bot signed in successfully: @{getattr(me, 'username', 'bot')}")
            return me, self.session_str
        except Exception as e:
            logger.error(f"[TeleVault] sign_in_bot failed: {e}")
            raise

    def auto_discover_bot_chat_id(self, bot_token: Optional[str] = None) -> Optional[int]:
        """
        Uses Telegram Bot getUpdates API to automatically find the most recent
        chat ID of a user interacting with this bot.
        """
        token = bot_token or self.bot_token
        if not token:
            return None
        try:
            req_url = f"https://api.telegram.org/bot{token}/getUpdates"
            with urllib.request.urlopen(req_url, timeout=4) as response:
                update_data = json.loads(response.read().decode())
                if update_data.get("ok") and update_data.get("result"):
                    for upd in reversed(update_data["result"]):
                        msg = upd.get("message") or upd.get("channel_post") or upd.get("my_chat_member")
                        if msg and msg.get("chat"):
                            found_id = msg["chat"]["id"]
                            logger.info(f"[TeleVault] Auto-discovered bot chat ID: {found_id}")
                            return found_id
        except Exception as upd_err:
            logger.debug(f"[TeleVault] getUpdates lookup notice: {upd_err}")
        return None

    def attach_bot_event_handlers(self):
        """
        Attaches interactive Telegram bot event listeners for commands (/start, /status, /files, /help)
        and callback queries.
        """
        if not self.client:
            return

        @self.client.on(events.NewMessage)
        async def on_new_message(event):
            try:
                chat_id = event.chat_id
                # Record chat_id in database if needed
                self._persist_bot_chat_id(chat_id)

                text = (event.raw_text or "").strip().lower()
                if not text:
                    return

                if text.startswith("/start") or text.startswith("/menu") or text.startswith("/help"):
                    await self.send_bot_welcome(chat_id)
                elif text.startswith("/status") or text.startswith("/stats"):
                    await self._send_stats(chat_id)
                elif text.startswith("/files") or text.startswith("/recent"):
                    await self._send_recent_files(chat_id)
                elif text.startswith("/sec") or text.startswith("/security"):
                    await self._send_security_info(chat_id)
            except Exception as ex:
                logger.error(f"[TeleVault] Bot message handler error: {ex}", exc_info=True)

        @self.client.on(events.CallbackQuery)
        async def on_callback_query(event):
            try:
                await event.answer()  # Acknowledge immediately to avoid button spinner hanging
                data = event.data
                chat_id = event.chat_id
                self._persist_bot_chat_id(chat_id)

                if data == b"stats":
                    await self._send_stats(chat_id)
                elif data == b"recent":
                    await self._send_recent_files(chat_id)
                elif data == b"sec":
                    await self._send_security_info(chat_id)
                elif data == b"help":
                    await self.send_bot_welcome(chat_id)
            except Exception as ex:
                logger.error(f"[TeleVault] Callback query error: {ex}", exc_info=True)

    def _persist_bot_chat_id(self, chat_id: int):
        try:
            from app.services.vfs import engine
            from app.models.schemas import AppSettings
            from sqlmodel import Session
            with Session(engine) as session:
                settings_rec = session.get(AppSettings, 1)
                if settings_rec and not settings_rec.vault_channel_id:
                    settings_rec.vault_channel_id = chat_id
                    session.add(settings_rec)
                    session.commit()
                    self.channel_id = chat_id
                    logger.info(f"[TeleVault] Persisted active bot chat_id: {chat_id}")
        except Exception as e:
            logger.debug(f"[TeleVault] DB chat_id persist notice: {e}")

    async def send_bot_welcome(self, chat_id: int):
        text = (
            "🛡️ **TeleVault Zero-Knowledge Cloud Storage**\n\n"
            "Your Telegram chat is active and connected as a secure storage node.\n\n"
            "🔒 **Security**: Client-side AES-256-GCM + 600k PBKDF2 iterations\n"
            "📁 **Storage Quota**: Unlimited Telegram MTProto Cloud\n"
            "⚡ **Max Speed**: Multi-threaded chunk streaming\n"
            "🌐 **Web Dashboard**: `http://localhost:5173`\n\n"
            "All encrypted chunks uploaded from your browser are securely anchored in this chat."
        )
        buttons = [
            [Button.inline("📊 Storage Stats", data=b"stats"), Button.inline("📁 Recent Files", data=b"recent")],
            [Button.inline("🔒 Security Details", data=b"sec"), Button.inline("ℹ️ Help & Info", data=b"help")]
        ]
        try:
            await self.client.send_message(chat_id, text, buttons=buttons)
        except Exception as e:
            logger.warning(f"[TeleVault] send_bot_welcome notice: {e}")

    async def _send_security_info(self, chat_id: int):
        sec_text = (
            "🔒 **TeleVault Zero-Knowledge Security Protocol**\n\n"
            "• **Client-Side Encryption**: AES-256-GCM authenticated cipher.\n"
            "• **Key Derivation**: PBKDF2-HMAC-SHA256 with 600,000 rounds.\n"
            "• **Pure Zero-Knowledge**: Telegram servers only see random ciphertext.\n"
            "• **Replay/Swap Protection**: Each chunk is cryptographically bound to its file ID and index.\n"
            "• **Decryption**: Occurs strictly in your local browser runtime."
        )
        buttons = [
            [Button.inline("📊 Storage Stats", data=b"stats"), Button.inline("📁 Recent Files", data=b"recent")]
        ]
        await self.client.send_message(chat_id, sec_text, buttons=buttons)

    async def _send_recent_files(self, chat_id: int):
        from app.services.vfs import engine
        from app.models.schemas import FileRecord
        from sqlmodel import Session, select
        try:
            with Session(engine) as session:
                files = session.exec(
                    select(FileRecord).where(FileRecord.is_trashed == False).order_by(FileRecord.created_at.desc()).limit(10)
                ).all()

            if not files:
                await self.client.send_message(
                    chat_id,
                    "📁 **TeleVault is currently empty.**\n\nUpload files from your web dashboard at `http://localhost:5173`."
                )
                return

            lines = ["📁 **Recent Encrypted Files in TeleVault:**\n"]
            for f in files:
                size_kb = f.size / 1024
                size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb/1024:.1f} MB"
                lines.append(f"• `{f.name}` ({size_str}) — {f.chunk_count} chunk(s)")

            buttons = [
                [Button.inline("📊 Storage Stats", data=b"stats"), Button.inline("🔄 Refresh", data=b"recent")]
            ]
            await self.client.send_message(chat_id, "\n".join(lines), buttons=buttons)
        except Exception as e:
            logger.error(f"[TeleVault] _send_recent_files error: {e}")

    async def _send_stats(self, chat_id: int):
        from app.services.vfs import engine
        from app.models.schemas import FileRecord
        from sqlmodel import Session, select
        try:
            with Session(engine) as session:
                files = session.exec(select(FileRecord).where(FileRecord.is_trashed == False)).all()
                total_size = sum(f.size for f in files)
                count = len(files)

            def fmt_bytes(b):
                if b < 1024: return f"{b} B"
                elif b < 1024*1024: return f"{b/1024:.1f} KB"
                elif b < 1024*1024*1024: return f"{b/(1024*1024):.1f} MB"
                else: return f"{b/(1024*1024*1024):.2f} GB"

            stats_text = (
                "📊 **TeleVault Storage Status**\n\n"
                f"📁 **Total Encrypted Files**: `{count}`\n"
                f"💾 **Total Space Used**: `{fmt_bytes(total_size)}`\n"
                f"⚡ **Bandwidth & Quota**: Unlimited via Telegram\n"
                f"🌐 **Dashboard**: `http://localhost:5173`"
            )
            buttons = [
                [Button.inline("🔄 Refresh Stats", data=b"stats"), Button.inline("📁 Recent Files", data=b"recent")]
            ]
            await self.client.send_message(chat_id, stats_text, buttons=buttons)
        except Exception as e:
            logger.error(f"[TeleVault] _send_stats error: {e}")

    # ==========================================
    # Channel Provisioning & Cloaking
    # ==========================================

    async def get_or_create_vault_channel(self, title: str = settings.VAULT_CHANNEL_TITLE) -> Optional[int]:
        """
        Locates an existing TeleVault storage channel or creates a new private channel,
        then automatically mutes and archives it so it is cloaked from the main chat list.
        Falls back to 'me' (Saved Messages) if channel creation is restricted.
        """
        await self.ensure_connected()

        try:
            dialogs = await self.client.get_dialogs()
            for dialog in dialogs:
                if dialog.is_channel and dialog.title == title:
                    self.channel_id = dialog.id
                    return dialog.id

            # Create new private channel
            created = await self.client(functions.channels.CreateChannelRequest(
                title=title,
                about="Automated zero-knowledge encrypted cloud storage by TeleVault. Do not edit or delete messages manually.",
                broadcast=True,
                megagroup=False
            ))
            channel = created.chats[0]
            self.channel_id = channel.id

            # Cloaking: Move to Telegram Archive (folder_id=1)
            try:
                peer = await self.client.get_input_entity(channel)
                await self.client(functions.folders.EditPeerFoldersRequest(
                    folder_peers=[types.InputFolderPeer(peer=peer, folder_id=1)]
                ))
                # Mute notifications completely
                await self.client(functions.account.UpdateNotifySettingsRequest(
                    peer=types.InputNotifyPeer(peer=peer),
                    settings=types.InputPeerNotifySettings(mute_until=2147483647)
                ))
            except Exception as err:
                logger.warning(f"[TeleVault] Archive cloaking warning (non-fatal): {err}")

            return channel.id
        except Exception as err:
            logger.info(f"[TeleVault] Channel creation notice (using Saved Messages 'me'): {err}")
            self.channel_id = None
            return None

    # ==========================================
    # High-Performance Chunk Upload & Download
    # ==========================================

    async def upload_encrypted_chunk(
        self,
        chunk_bytes: bytes,
        filename: str,
        channel_id: Optional[Union[int, str]] = None,
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> int:
        """
        Uploads a single binary chunk directly to the target Telegram peer.
        Handles FloodWait, retries, and returns the real Telegram message ID.
        """
        await self.ensure_connected()

        me = await self.client.get_me()
        is_bot = getattr(me, 'bot', False)

        target = channel_id
        if target is None:
            if is_bot:
                # Attempt auto-discovery
                discovered = self.auto_discover_bot_chat_id()
                if discovered:
                    target = discovered
                else:
                    raise RuntimeError(
                        f"Telegram bot @{getattr(me, 'username', 'storage_bot')} has no target chat ID yet. "
                        f"Please open Telegram, find your bot, tap START, and try again."
                    )
            else:
                target = 'me'

        # Upload file bytes to Telegram MTProto
        uploaded_file = await self.client.upload_file(
            chunk_bytes,
            file_name=filename,
            progress_callback=progress_callback
        )

        # Send file message with retry on flood wait
        for attempt in range(3):
            try:
                msg = await self.client.send_file(
                    target,
                    uploaded_file,
                    caption=f"TeleVault Chunk: {filename}",
                    silent=True,
                    force_document=True
                )
                return msg.id
            except errors.FloodWaitError as fwe:
                if fwe.seconds <= settings.MAX_FLOOD_WAIT_SECONDS:
                    logger.warning(f"[TeleVault] Flood wait on upload: sleeping {fwe.seconds}s...")
                    await asyncio.sleep(fwe.seconds)
                else:
                    raise RuntimeError(f"Telegram upload flood wait: please wait {fwe.seconds} seconds.")
            except Exception as e:
                logger.error(f"[TeleVault] upload_encrypted_chunk error (attempt {attempt+1}): {e}")
                if attempt == 2:
                    raise

        raise RuntimeError("Failed to upload chunk after 3 attempts.")

    async def download_chunk(
        self,
        channel_id: Optional[Union[int, str]],
        message_id: int,
        progress_callback: Optional[Callable[[int, int], None]] = None
    ) -> bytes:
        """
        Downloads a single binary chunk from Telegram given its message ID.
        """
        await self.ensure_connected()

        me = await self.client.get_me()
        is_bot = getattr(me, 'bot', False)

        target = channel_id
        if target is None:
            if is_bot:
                discovered = self.auto_discover_bot_chat_id()
                if discovered:
                    target = discovered
                else:
                    raise RuntimeError("Bot storage has no target chat ID configured.")
            else:
                target = 'me'

        for attempt in range(3):
            try:
                msg = await self.client.get_messages(target, ids=message_id)
                if not msg or not msg.media:
                    raise FileNotFoundError(f"Chunk message ID {message_id} not found on target {target}.")

                byte_buffer = await self.client.download_media(
                    msg,
                    file=bytes,
                    progress_callback=progress_callback
                )
                if byte_buffer is None:
                    raise RuntimeError(f"Failed to download media for chunk {message_id}.")
                return byte_buffer
            except errors.FloodWaitError as fwe:
                if fwe.seconds <= settings.MAX_FLOOD_WAIT_SECONDS:
                    logger.warning(f"[TeleVault] Flood wait on download: sleeping {fwe.seconds}s...")
                    await asyncio.sleep(fwe.seconds)
                else:
                    raise RuntimeError(f"Telegram download flood wait: please wait {fwe.seconds} seconds.")
            except Exception as e:
                logger.error(f"[TeleVault] download_chunk error (attempt {attempt+1}): {e}")
                if attempt == 2:
                    raise

        raise RuntimeError(f"Failed to download chunk {message_id} after 3 attempts.")

    async def download_chunk_stream(
        self,
        channel_id: Optional[Union[int, str]],
        message_id: int,
        chunk_size: int = 64 * 1024
    ) -> AsyncGenerator[bytes, None]:
        """
        Streams binary data of a chunk in blocks.
        """
        data = await self.download_chunk(channel_id, message_id)
        for i in range(0, len(data), chunk_size):
            yield data[i:i + chunk_size]
