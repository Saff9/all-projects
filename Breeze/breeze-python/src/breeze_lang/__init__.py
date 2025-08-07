"""Breeze — the easiest programming language. Python bindings.

Run Breeze programs from Python:

    import breeze_lang as breeze
    result = breeze.run('show "Hello from Breeze!" 1 + 2')
    for line in result["output"]:
        print(line)

This package uses the fast Breeze runtime (Native Rust binary or Node.js).
Install it globally with:

    npm install -g breeze-lang

Or point ``BREEZE_PATH`` at a custom ``breeze`` executable.
"""

import os
import shutil
import subprocess
from pathlib import Path


__version__ = "1.3.0"

_CACHED_BREEZE_CMD = None


class BreezeError(Exception):
    """Raised when a Breeze program fails to run."""
    pass


def _find_breeze():
    """Locate the breeze executable or command.

    Resolution order:
      1. ``$BREEZE_PATH`` environment variable (if it points to a file).
      2. The ``breeze`` executable on ``$PATH``.
      3. Local repository Rust binary (target/release or target/debug).
      4. Local repository Node CLI (node breeze-node/bin/breeze.js).
      5. Raise :class:`BreezeError` with install instructions.
    """
    global _CACHED_BREEZE_CMD
    if _CACHED_BREEZE_CMD is not None:
        return _CACHED_BREEZE_CMD

    import sys

    # 1. Environment variable override
    env_path = os.environ.get("BREEZE_PATH")
    if env_path and os.path.isfile(env_path):
        _CACHED_BREEZE_CMD = [env_path]
        return _CACHED_BREEZE_CMD

    # 2. Check for repository native binaries or Node runtime
    repo_root = Path(__file__).resolve().parent.parent.parent.parent
    possible_rust_binaries = [
        repo_root / "breeze-rs" / "target" / "x86_64-pc-windows-gnullvm" / "release" / "breeze.exe",
        repo_root / "breeze-rs" / "target" / "release" / "breeze.exe",
        repo_root / "breeze-rs" / "target" / "release" / "breeze",
        repo_root / "breeze-rs" / "target" / "x86_64-pc-windows-gnullvm" / "debug" / "breeze.exe",
        repo_root / "breeze-rs" / "target" / "debug" / "breeze.exe",
        repo_root / "breeze-rs" / "target" / "debug" / "breeze",
    ]
    for b in possible_rust_binaries:
        if b.is_file():
            _CACHED_BREEZE_CMD = [str(b)]
            return _CACHED_BREEZE_CMD

    node_cli = repo_root / "breeze-node" / "bin" / "breeze.js"
    node_exe = shutil.which("node")
    if node_cli.is_file() and node_exe:
        _CACHED_BREEZE_CMD = [node_exe, str(node_cli)]
        return _CACHED_BREEZE_CMD

    # 3. Check for external 'breeze' on PATH (excluding current python venv wrapper)
    found = shutil.which("breeze")
    if found:
        found_resolved = Path(found).resolve()
        venv_resolved = Path(sys.prefix).resolve()
        try:
            is_in_venv = found_resolved.is_relative_to(venv_resolved)
        except AttributeError:
            is_in_venv = str(found_resolved).startswith(str(venv_resolved))
        if not is_in_venv:
            _CACHED_BREEZE_CMD = [found]
            return _CACHED_BREEZE_CMD

    raise BreezeError(
        "Breeze runtime not found. Install it with:  npm install -g breeze-lang\n"
        "Or set the BREEZE_PATH environment variable to the breeze executable."
    )


def _parse_error_line(stderr_text):
    """Pull the line number out of an error string of the form
    ``Error (line 7): ...``. Returns ``None`` if not present."""
    if not stderr_text:
        return None
    marker = "(line "
    idx = stderr_text.find(marker)
    if idx < 0:
        return None
    rest = stderr_text[idx + len(marker):]
    end = rest.find(")")
    if end < 0:
        return None
    try:
        return int(rest[:end])
    except ValueError:
        return None


def _run_proc(proc, timeout_kind):
    """Turn a finished :class:`subprocess.CompletedProcess` into a result
    dict. ``timeout_kind`` is just used for the error message text."""
    output = proc.stdout.splitlines() if proc.stdout else []
    if proc.returncode == 0:
        return {"output": output, "error": None, "error_line": None}
    err = (proc.stderr or "").strip()
    line = _parse_error_line(err)
    return {"output": output, "error": err, "error_line": line}


def run(source: str) -> dict:
    """Run Breeze source code.

    Returns a dict with three keys:
      - ``output``: ``list[str]`` — the lines the Breeze program printed.
      - ``error``:  ``str | None`` — the formatted error, if any.
      - ``error_line``: ``int | None`` — the source line number, if known.

    Raises :class:`BreezeError` if the Breeze runtime isn't installed or
    the program times out.
    """
    breeze_cmd = _find_breeze()
    try:
        proc = subprocess.run(
            [*breeze_cmd, "eval", source],
            capture_output=True, text=True, timeout=30,
        )
    except subprocess.TimeoutExpired:
        raise BreezeError("Breeze program timed out (30s limit)")
    except FileNotFoundError as e:
        raise BreezeError(f"Breeze executable disappeared: {e}")
    if proc.returncode == 2:
        raise BreezeError(f"Breeze CLI error: {(proc.stderr or '').strip()}")
    return _run_proc(proc, "eval")


def run_file(path: str) -> dict:
    """Run a ``.bz`` file. Returns the same dict shape as :func:`run`."""
    breeze_cmd = _find_breeze()
    p = Path(path)
    if not p.is_file():
        raise BreezeError(f"File not found: {path}")
    try:
        proc = subprocess.run(
            [*breeze_cmd, "run", str(p)],
            capture_output=True, text=True, timeout=60,
        )
    except subprocess.TimeoutExpired:
        raise BreezeError("Breeze program timed out (60s limit)")
    except FileNotFoundError as e:
        raise BreezeError(f"Breeze executable disappeared: {e}")
    if proc.returncode == 2:
        raise BreezeError(f"Breeze CLI error: {(proc.stderr or '').strip()}")
    return _run_proc(proc, "run")


def check_file(path: str) -> dict:
    """Validate Breeze file syntax without running it."""
    breeze_cmd = _find_breeze()
    p = Path(path)
    if not p.is_file():
        raise BreezeError(f"File not found: {path}")
    proc = subprocess.run(
        [*breeze_cmd, "check", str(p)],
        capture_output=True, text=True, timeout=10,
    )
    return _run_proc(proc, "check")


def version() -> str:
    """Return the Breeze package version."""
    return __version__


eval_code = run

__all__ = [
    "run",
    "run_file",
    "check_file",
    "eval_code",
    "version",
    "BreezeError",
    "__version__",
]
