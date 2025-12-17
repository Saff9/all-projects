# TeleVault 🛡️
> **Zero-Knowledge Encrypted Cloud Drive Powered by Telegram MTProto Infrastructure**

TeleVault transforms Telegram's unlimited cloud storage into a private, end-to-end encrypted, and high-performance cloud drive with a modern, high-contrast Obsidian dark interface.

---

## ⚡ Features at a Glance

- **🔒 100% Zero-Knowledge Encryption**: Every file is encrypted and decrypted locally in your browser using **AES-256-GCM** with keys derived via **PBKDF2 (100,000 iterations)**. Unencrypted files and encryption keys never leave your device.
- **☁️ Unlimited Free Storage**: Leverages Telegram's distributed MTProto cloud storage architecture with zero monthly hosting costs.
- **🧩 10MB Multi-Part Chunk Pipeline**: Handles files of any size by slicing them into 10MB encrypted chunks uploaded sequentially or concurrently.
- **🎬 In-Memory Media Streaming**: Stream 4K video, audio playlists, high-resolution photos, and code syntax highlighting directly from decrypted in-memory chunk buffers without saving unencrypted files to disk.
- **🔄 Cross-Browser Real-Time Sync**: Access and decrypt your vault seamlessly across multiple browsers (Chrome, Brave, Edge) with automatic master salt synchronization.
- **🤖 Interactive Telegram Bot**: Connect in 1 click using your Telegram Bot Token. The bot auto-discovers your chat, sends interactive menus (`/start`, `/stats`, `/files`), and stores data in a dedicated, cloaked channel in your **Archived Chats**.
- **📱 Multi-Mode Connection**: Connect via **Bot Token**, **Desktop QR Code Scan**, or **Phone OTP**.

---

## 📐 Architecture Overview

```
+-------------------------------------------------------------------------+
|                        TELEVAULT CLIENT (REACT 19)                      |
|                                                                         |
|   +-----------------------+     +-----------------------------------+   |
|   |   Master Password     | --> | PBKDF2 Key Derivation (100k iter) |   |
|   +-----------------------+     +-----------------------------------+   |
|                                                   |                     |
|   +-----------------------+     +-----------------v-----------------+   |
|   |     Original File     | --> | Sliced into 10MB Binary Chunks    |   |
|   +-----------------------+     +-----------------------------------+   |
|                                                   |                     |
|                                 +-----------------v-----------------+   |
|                                 | AES-256-GCM Client-Side Cipher    |   |
|                                 +-----------------------------------+   |
+---------------------------------------------------|---------------------+
                                                    | (Encrypted Binary)
                                                    v
+-------------------------------------------------------------------------+
|                        FASTAPI LOCAL BACKEND                            |
|                                                                         |
|   +-----------------------+     +-----------------------------------+   |
|   | SQLite VFS Database   | <-> | Telegram MTProto Engine (Telethon)|   |
|   | (Metadata & Chunks)   |     +-----------------------------------+   |
|   +-----------------------+                       |                     |
+---------------------------------------------------|---------------------+
                                                    | (MTProto Upload)
                                                    v
+-------------------------------------------------------------------------+
|                   TELEGRAM CLOUD INFRASTRUCTURE (MTPROTO)               |
|                                                                         |
|          [ Cloaked Dedicated Storage Channel (Archived & Muted) ]       |
|          Message ID: 101 -> chunk_001.bin (AES-256 Encrypted)           |
|          Message ID: 102 -> chunk_002.bin (AES-256 Encrypted)           |
+-------------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (Obsidian Titanium Pro Theme)
- **Icons**: Lucide React
- **Cryptography**: Web Crypto API (SubtleCrypto AES-256-GCM, PBKDF2 SHA-256)
- **Local Storage**: IndexedDB + In-Memory Live Blob Registry

### Backend
- **Framework**: FastAPI (Python 3.10+) + Uvicorn
- **Telegram MTProto Engine**: Telethon
- **Database & ORM**: SQLite + SQLModel (SQLAlchemy)
- **Validation**: Pydantic v2

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.10 or higher)
- A Telegram account or Bot Token from [@BotFather](https://t.me/BotFather)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Saff9/TeleVault.git
cd TeleVault
```

---

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

### Step 3: Frontend Setup
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🔐 1-Click Bot Setup (Recommended)

1. Open Telegram and search for [@BotFather](https://t.me/BotFather).
2. Send `/newbot` and follow the prompts to choose a name and username.
3. Copy the HTTP API token provided by BotFather.
4. On TeleVault's onboarding screen:
   - Set your **Master Password** (used for local encryption).
   - Paste your **Bot Token** and click **Connect**.
5. In Telegram, open your newly created bot and click **START**.
6. TeleVault will automatically bind to your bot, create an archived storage channel, and open your drive!

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Get backend connection status, configuration state, and master salt. |
| `POST` | `/api/auth/setup-password` | Initialize master password and generate local salt. |
| `POST` | `/api/auth/unlock` | Validate master password and return decryption salt. |
| `GET` | `/api/files` | Query files by folder, category, favorites, or search query. |
| `POST` | `/api/files/record` | Save file record and chunk metadata. |
| `POST` | `/api/files/upload-chunk` | Stream an encrypted binary chunk directly to Telegram. |
| `GET` | `/api/files/download-chunk/{id}` | Download a specific binary chunk from Telegram. |
| `POST` | `/api/files/{id}/trash` | Move a file to the Recycle Bin. |
| `POST` | `/api/files/{id}/restore` | Restore a file from the Recycle Bin. |
| `DELETE` | `/api/files/{id}/permanent` | Permanently remove a file and its chunks. |
| `GET` | `/api/storage/stats` | Retrieve total storage usage and category breakdown. |

---

## 🛡️ Security & Privacy Model

- **No Plaintext Storage**: File names, contents, and metadata are masked before hitting Telegram. Telegram servers only store raw encrypted binary payloads (`chunk_xxxx.bin`).
- **Zero-Knowledge Guarantee**: The server does not store unencrypted Master Passwords. Master passwords are verified using cryptographic hashes with unique salts.
- **Stealth Cloaking**: The storage channel is muted and automatically placed in Telegram's **Archived Chats** to keep your primary chat interface completely clean.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
