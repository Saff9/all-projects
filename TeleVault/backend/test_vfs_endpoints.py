import os
import sys
import json
import sqlite3

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.db.vfs import init_db, engine, VirtualFileSystem
from app.models.schemas import AppSettings, FileRecord, Folder, ChunkRecord, SyncWatcher

client = TestClient(app)

def test_all():
    print("=== 1. Testing Database Initialization & Migrations ===")
    init_db()
    
    conn = sqlite3.connect("televault.db")
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [r[0] for r in cur.fetchall()]
    print("Existing SQLite Tables:", tables)
    assert "files" in tables, "Table 'files' missing!"
    assert "folders" in tables, "Table 'folders' missing!"
    assert "chunks" in tables, "Table 'chunks' missing!"
    assert "settings" in tables, "Table 'settings' missing!"
    assert "sync_watchers" in tables, "Table 'sync_watchers' missing!"
    
    # Check required columns
    cur.execute("PRAGMA table_info(settings)")
    settings_cols = [c[1] for c in cur.fetchall()]
    print("Settings columns:", settings_cols)
    assert "master_salt_hex" in settings_cols
    assert "master_hash_hex" in settings_cols
    assert "telegram_bot_token" in settings_cols
    assert "telegram_chat_id" in settings_cols

    cur.execute("PRAGMA table_info(files)")
    files_cols = [c[1] for c in cur.fetchall()]
    print("Files columns:", files_cols)
    assert "category" in files_cols
    assert "is_favorite" in files_cols
    assert "is_trashed" in files_cols
    assert "chunk_count" in files_cols
    assert "telegram_message_ids" in files_cols
    assert "created_at" in files_cols
    assert "updated_at" in files_cols

    conn.close()
    print("[OK] DB Schema & Migrations Verified Successfully.")

    print("\n=== 2. Testing Auth & Salt Sync ===")
    res = client.get("/api/status")
    assert res.status_code == 200, res.text
    status_data = res.json()
    print("Initial /api/status:", status_data)

    # Setup Master Password
    setup_payload = {"master_password": "SuperSecretVaultPassword123!"}
    res = client.post("/api/auth/setup-password", json=setup_payload)
    assert res.status_code == 200, res.text
    setup_data = res.json()
    print("Setup Password Response:", setup_data)
    salt_hex = setup_data["salt_hex"]
    assert salt_hex, "Salt hex missing in setup response"

    # Status check after setup
    res = client.get("/api/status")
    status_after = res.json()
    print("After Setup /api/status:", status_after)
    assert status_after["has_password"] is True
    assert status_after["salt_hex"] == salt_hex
    assert status_after["master_salt_hex"] == salt_hex

    # Unlock with valid password
    res = client.post("/api/auth/unlock", json={"master_password": "SuperSecretVaultPassword123!"})
    assert res.status_code == 200, res.text
    unlock_data = res.json()
    print("Unlock Response (Success):", unlock_data)
    assert unlock_data["unlocked"] is True
    assert unlock_data["salt_hex"] == salt_hex

    # Unlock with invalid password
    res = client.post("/api/auth/unlock", json={"master_password": "WrongPassword456"})
    assert res.status_code == 401, f"Expected 401 but got {res.status_code}"
    print("Unlock Response (Wrong Password -> 401):", res.json())
    print("[OK] Auth & Salt Sync Verified Successfully.")

    print("\n=== 3. Testing Folders CRUD ===")
    res = client.get("/api/folders")
    assert res.status_code == 200
    folders = res.json()
    print(f"Listed {len(folders)} folders:", [f["name"] for f in folders])

    # Create folder
    new_folder_payload = {"name": "Test Project Folder", "color": "#ff5722", "icon": "briefcase"}
    res = client.post("/api/folders", json=new_folder_payload)
    assert res.status_code == 200, res.text
    new_folder = res.json()
    folder_id = new_folder["id"]
    print("Created folder:", new_folder)

    # Get single folder
    res = client.get(f"/api/folders/{folder_id}")
    assert res.status_code == 200
    assert res.json()["name"] == "Test Project Folder"

    # Rename folder
    res = client.patch(f"/api/folders/{folder_id}", json={"name": "Renamed Project Folder", "color": "#00e676"})
    assert res.status_code == 200
    assert res.json()["name"] == "Renamed Project Folder"
    assert res.json()["color"] == "#00e676"
    print("Renamed folder successfully.")

    print("\n=== 4. Testing Files & Chunks CRUD & VFS Actions ===")
    test_file_id = "test-file-001"
    file_record_payload = {
        "id": test_file_id,
        "name": "financial_report_2026.pdf",
        "size": 1048576,  # 1MB
        "mime_type": "application/pdf",
        "category": "documents",
        "parent_id": folder_id,
        "is_encrypted": True,
        "is_favorite": False,
        "is_trashed": False,
        "chunk_count": 2,
        "telegram_message_ids": [101, 102],
        "chunks": [
            {"chunk_index": 0, "byte_size": 524288, "telegram_message_id": 101},
            {"chunk_index": 1, "byte_size": 524288, "telegram_message_id": 102}
        ]
    }
    res = client.post("/api/files/record", json=file_record_payload)
    assert res.status_code == 200, res.text
    saved_file = res.json()
    print("Saved file record:", saved_file)
    assert saved_file["id"] == test_file_id
    assert saved_file["category"] == "documents"

    # Second file
    img_file_id = "test-file-002"
    img_payload = {
        "id": img_file_id,
        "name": "photo.png",
        "size": 2048000,
        "mime_type": "image/png",
        "category": "images",
        "parent_id": None,
        "is_encrypted": True,
        "is_favorite": True,
        "is_trashed": False,
        "chunk_count": 1,
        "telegram_message_ids": [103]
    }
    res = client.post("/api/files/record", json=img_payload)
    assert res.status_code == 200

    # List files
    res = client.get("/api/files")
    assert res.status_code == 200
    all_files = res.json()
    print(f"Listed {len(all_files)} files.")
    assert any(f["id"] == test_file_id for f in all_files)

    # Filter by category
    res = client.get("/api/files?category=documents")
    doc_files = res.json()
    assert all(f["category"] == "documents" for f in doc_files)
    print("Filtered documents category count:", len(doc_files))

    # Toggle favorite
    res = client.post(f"/api/files/{test_file_id}/favorite")
    assert res.status_code == 200
    assert res.json()["is_favorite"] is True
    print("Toggled favorite to True.")

    # Move to trash
    res = client.post(f"/api/files/{test_file_id}/trash")
    assert res.status_code == 200
    assert res.json()["trashed"] is True
    print("Moved to trash.")

    # Check trashed list
    res = client.get("/api/files?trashed=true")
    trashed_files = res.json()
    assert any(f["id"] == test_file_id for f in trashed_files)
    print("Found in trash list.")

    # Restore from trash
    res = client.post(f"/api/files/{test_file_id}/restore")
    assert res.status_code == 200
    assert res.json()["restored"] is True
    print("Restored from trash.")

    # Trash again and test empty-trash
    client.post(f"/api/files/{test_file_id}/trash")
    res = client.post("/api/files/empty-trash")
    assert res.status_code == 200
    empty_trash_res = res.json()
    print("Empty trash result:", empty_trash_res)
    assert empty_trash_res["deleted_count"] >= 1

    # Verify permanently deleted
    res = client.get(f"/api/files/{test_file_id}")
    assert res.status_code == 404
    print("Verified file is permanently gone.")

    print("\n=== 5. Testing Storage Stats ===")
    res = client.get("/api/storage/stats")
    assert res.status_code == 200
    stats = res.json()
    print("Storage Stats:", json.dumps(stats, indent=2))
    assert "total_bytes" in stats
    assert "breakdown" in stats
    assert stats["breakdown"]["images"] >= 2048000

    print("\n=== 6. Testing Search ===")
    res = client.get("/api/search?q=photo")
    assert res.status_code == 200
    search_results = res.json()
    print("Search results for 'photo':", [f["name"] for f in search_results])
    assert len(search_results) >= 1

    print("\n=== 7. Testing Sync Watchers ===")
    sync_payload = {
        "local_folder": "C:/Projects/Documents/VaultSync",
        "remote_folder_id": folder_id,
        "mode": "backup",
        "wifi_only": True
    }
    res = client.post("/api/sync/watchers", json=sync_payload)
    assert res.status_code == 200
    created_watcher = res.json()
    watcher_id = created_watcher["id"]
    print("Created sync watcher:", created_watcher)

    res = client.get("/api/sync/watchers")
    assert res.status_code == 200
    watchers = res.json()
    assert any(w["id"] == watcher_id for w in watchers)

    res = client.delete(f"/api/sync/watchers/{watcher_id}")
    assert res.status_code == 200
    print("Deleted sync watcher.")

    # Cleanup folder
    client.delete(f"/api/folders/{folder_id}")
    # Cleanup image file
    client.delete(f"/api/files/{img_file_id}/permanent")

    print("\n=========================================")
    print("ALL TESTS PASSED SUCCESSFULLY! 100% OK")
    print("=========================================")

if __name__ == "__main__":
    test_all()
