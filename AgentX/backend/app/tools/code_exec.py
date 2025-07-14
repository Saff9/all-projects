"""Python code execution in a sandboxed subprocess."""
from __future__ import annotations
import asyncio
import sys


async def code_exec(code: str, timeout: int = 10) -> str:
    """Execute Python code in a subprocess and return stdout + stderr."""
    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, "-c", code,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=timeout)
        except asyncio.TimeoutError:
            proc.kill()
            return f"Code execution timed out after {timeout} seconds."

        out = stdout.decode("utf-8", errors="replace").strip()
        err = stderr.decode("utf-8", errors="replace").strip()

        result = ""
        if out:
            result += f"Output:\n{out}\n"
        if err:
            result += f"Stderr:\n{err}\n"
        if proc.returncode != 0:
            result += f"Exit code: {proc.returncode}"

        return result.strip() or "Code executed successfully (no output)."

    except Exception as exc:
        return f"Failed to execute code: {exc}"
