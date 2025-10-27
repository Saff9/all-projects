"""
DocLite Python Driver
A lightweight, Pythonic embedded document database client (similar to PyMongo for SQLite).
"""

import ctypes
import json
import os
import sys
from typing import Any, Dict, List, Optional, Union

# Attempt to locate compiled shared library
def _load_library():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    candidates = [
        os.path.join(base_dir, "target", "release", "doclite.dll"),
        os.path.join(base_dir, "target", "debug", "doclite.dll"),
        os.path.join(base_dir, "target", "release", "libdoclite.so"),
        os.path.join(base_dir, "target", "debug", "libdoclite.so"),
        os.path.join(base_dir, "target", "release", "libdoclite.dylib"),
        os.path.join(base_dir, "target", "debug", "libdoclite.dylib"),
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ctypes.CDLL(path)
            except Exception:
                pass
    return None

_lib = _load_library()

if _lib:
    _lib.doclite_open.argtypes = [ctypes.c_char_p, ctypes.POINTER(ctypes.c_void_p)]
    _lib.doclite_open.restype = ctypes.c_int

    _lib.doclite_open_in_memory.argtypes = [ctypes.POINTER(ctypes.c_void_p)]
    _lib.doclite_open_in_memory.restype = ctypes.c_int

    _lib.doclite_close.argtypes = [ctypes.c_void_p]
    _lib.doclite_close.restype = None

    _lib.doclite_insert_one.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_char_p),
    ]
    _lib.doclite_insert_one.restype = ctypes.c_int

    _lib.doclite_insert_many.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_char_p),
    ]
    _lib.doclite_insert_many.restype = ctypes.c_int

    _lib.doclite_find_one.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_char_p),
    ]
    _lib.doclite_find_one.restype = ctypes.c_int

    _lib.doclite_find.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_char_p),
    ]
    _lib.doclite_find.restype = ctypes.c_int

    _lib.doclite_aggregate.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_char_p),
    ]
    _lib.doclite_aggregate.restype = ctypes.c_int

    _lib.doclite_create_index.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.c_int,
    ]
    _lib.doclite_create_index.restype = ctypes.c_int

    _lib.doclite_count_documents.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_uint64),
    ]
    _lib.doclite_count_documents.restype = ctypes.c_int

    _lib.doclite_update_one.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.c_int,
        ctypes.POINTER(ctypes.c_uint64),
    ]
    _lib.doclite_update_one.restype = ctypes.c_int

    _lib.doclite_delete_one.argtypes = [
        ctypes.c_void_p,
        ctypes.c_char_p,
        ctypes.c_char_p,
        ctypes.POINTER(ctypes.c_uint64),
    ]
    _lib.doclite_delete_one.restype = ctypes.c_int

    _lib.doclite_checkpoint.argtypes = [ctypes.c_void_p]
    _lib.doclite_checkpoint.restype = ctypes.c_int

    _lib.doclite_free_string.argtypes = [ctypes.c_char_p]
    _lib.doclite_free_string.restype = None

    _lib.doclite_last_error.argtypes = [ctypes.c_void_p]
    _lib.doclite_last_error.restype = ctypes.c_char_p


class Collection:
    def __init__(self, db: "DocLite", name: str):
        self.db = db
        self.name = name

    def insert_one(self, document: Dict[str, Any]) -> str:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        doc_json = json.dumps(document).encode("utf-8")
        out_id = ctypes.c_char_p()

        res = _lib.doclite_insert_one(
            self.db.handle,
            self.name.encode("utf-8"),
            doc_json,
            ctypes.byref(out_id),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Insert failed: {err.decode('utf-8') if err else 'Unknown error'}")

        inserted_id = out_id.value.decode("utf-8") if out_id.value else ""
        if out_id.value:
            _lib.doclite_free_string(out_id)
        return inserted_id

    def insert_many(self, documents: List[Dict[str, Any]]) -> List[str]:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        if not documents:
            return []

        docs_json = json.dumps(documents).encode("utf-8")
        out_ids = ctypes.c_char_p()

        res = _lib.doclite_insert_many(
            self.db.handle,
            self.name.encode("utf-8"),
            docs_json,
            ctypes.byref(out_ids),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Insert many failed: {err.decode('utf-8') if err else 'Unknown error'}")

        if not out_ids.value:
            return []

        result_str = out_ids.value.decode("utf-8")
        _lib.doclite_free_string(out_ids)
        return json.loads(result_str)

    def find_one(self, filter: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        filter_json = json.dumps(filter or {}).encode("utf-8")
        out_json = ctypes.c_char_p()

        res = _lib.doclite_find_one(
            self.db.handle,
            self.name.encode("utf-8"),
            filter_json,
            ctypes.byref(out_json),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Find failed: {err.decode('utf-8') if err else 'Unknown error'}")

        if not out_json.value:
            return None

        result_str = out_json.value.decode("utf-8")
        _lib.doclite_free_string(out_json)
        return json.loads(result_str)

    def find(self, filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        filter_json = json.dumps(filter or {}).encode("utf-8")
        out_json = ctypes.c_char_p()

        res = _lib.doclite_find(
            self.db.handle,
            self.name.encode("utf-8"),
            filter_json,
            ctypes.byref(out_json),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Find failed: {err.decode('utf-8') if err else 'Unknown error'}")

        if not out_json.value:
            return []

        result_str = out_json.value.decode("utf-8")
        _lib.doclite_free_string(out_json)
        return json.loads(result_str)

    def aggregate(self, pipeline: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        pipe_json = json.dumps(pipeline).encode("utf-8")
        out_json = ctypes.c_char_p()

        res = _lib.doclite_aggregate(
            self.db.handle,
            self.name.encode("utf-8"),
            pipe_json,
            ctypes.byref(out_json),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Aggregate failed: {err.decode('utf-8') if err else 'Unknown error'}")

        if not out_json.value:
            return []

        result_str = out_json.value.decode("utf-8")
        _lib.doclite_free_string(out_json)
        return json.loads(result_str)

    def create_index(self, fields: List[str], unique: bool = False) -> None:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        fields_json = json.dumps(fields).encode("utf-8")
        res = _lib.doclite_create_index(
            self.db.handle,
            self.name.encode("utf-8"),
            fields_json,
            1 if unique else 0,
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Create index failed: {err.decode('utf-8') if err else 'Unknown error'}")

    def count_documents(self, filter: Optional[Dict[str, Any]] = None) -> int:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        filter_json = json.dumps(filter or {}).encode("utf-8")
        out_count = ctypes.c_uint64()

        res = _lib.doclite_count_documents(
            self.db.handle,
            self.name.encode("utf-8"),
            filter_json,
            ctypes.byref(out_count),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Count failed: {err.decode('utf-8') if err else 'Unknown error'}")

        return out_count.value

    def update_one(
        self,
        filter: Dict[str, Any],
        update: Dict[str, Any],
        upsert: bool = False,
    ) -> int:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        filter_json = json.dumps(filter).encode("utf-8")
        update_json = json.dumps(update).encode("utf-8")
        out_modified = ctypes.c_uint64()

        res = _lib.doclite_update_one(
            self.db.handle,
            self.name.encode("utf-8"),
            filter_json,
            update_json,
            1 if upsert else 0,
            ctypes.byref(out_modified),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Update failed: {err.decode('utf-8') if err else 'Unknown error'}")

        return out_modified.value

    def delete_one(self, filter: Dict[str, Any]) -> int:
        if not self.db.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        filter_json = json.dumps(filter).encode("utf-8")
        out_deleted = ctypes.c_uint64()

        res = _lib.doclite_delete_one(
            self.db.handle,
            self.name.encode("utf-8"),
            filter_json,
            ctypes.byref(out_deleted),
        )
        if res != 0:
            err = _lib.doclite_last_error(self.db.handle)
            raise RuntimeError(f"Delete failed: {err.decode('utf-8') if err else 'Unknown error'}")

        return out_deleted.value


class DocLite:
    def __init__(self, path: Optional[str] = None):
        self.path = path
        self.handle = ctypes.c_void_p()

        if not _lib:
            raise RuntimeError(
                "DocLite shared library not found. Please build the project with `cargo build --release` first."
            )

        if path:
            res = _lib.doclite_open(path.encode("utf-8"), ctypes.byref(self.handle))
        else:
            res = _lib.doclite_open_in_memory(ctypes.byref(self.handle))

        if res != 0 or not self.handle:
            raise RuntimeError("Failed to initialize DocLite database")

    def checkpoint(self) -> None:
        if not self.handle or not _lib:
            raise RuntimeError("Database handle not initialized or library not loaded")

        res = _lib.doclite_checkpoint(self.handle)
        if res != 0:
            err = _lib.doclite_last_error(self.handle)
            raise RuntimeError(f"Checkpoint failed: {err.decode('utf-8') if err else 'Unknown error'}")

    def __getitem__(self, collection_name: str) -> Collection:
        return Collection(self, collection_name)

    def __getattr__(self, collection_name: str) -> Collection:
        return Collection(self, collection_name)

    def close(self):
        if self.handle and _lib:
            _lib.doclite_close(self.handle)
            self.handle = None

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
