"""File read/write/list operations within a safe workspace directory."""
from __future__ import annotations
import os
from pathlib import Path
from app.config import settings


def _safe_path(relative: str) -> Path:
    workspace = Path(settings.WORKSPACE_DIR).resolve()
    workspace.mkdir(parents=True, exist_ok=True)
    target = (workspace / relative).resolve()
    # Security: prevent escaping workspace
    if not str(target).startswith(str(workspace)):
        raise PermissionError(f"Access denied: path escapes workspace")
    return target


async def file_read(path: str) -> str:
    try:
        p = _safe_path(path)
        if not p.exists():
            return f"File not found: {path}"
        content = p.read_text(encoding="utf-8", errors="replace")
        if len(content) > 8000:
            return content[:8000] + "\n... [file truncated at 8000 chars]"
        return content
    except PermissionError as e:
        return str(e)
    except Exception as exc:
        return f"Error reading file: {exc}"


async def file_write(path: str, content: str) -> str:
    try:
        p = _safe_path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return f"Successfully wrote {len(content)} characters to {path}"
    except PermissionError as e:
        return str(e)
    except Exception as exc:
        return f"Error writing file: {exc}"


async def file_list(path: str = ".") -> str:
    try:
        p = _safe_path(path)
        if not p.exists():
            return f"Path not found: {path}"
        entries = []
        for entry in sorted(p.iterdir()):
            size = entry.stat().st_size if entry.is_file() else 0
            kind = "DIR " if entry.is_dir() else f"{size:>8} bytes"
            entries.append(f"  {kind}  {entry.name}")
        if not entries:
            return f"Directory '{path}' is empty."
        return f"Contents of '{path}':\n" + "\n".join(entries)
    except PermissionError as e:
        return str(e)
    except Exception as exc:
        return f"Error listing directory: {exc}"
