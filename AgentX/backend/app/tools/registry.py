"""
Tool Registry – central dispatcher for all agent tools.
"""
from __future__ import annotations

from typing import Any
from dataclasses import dataclass, field


@dataclass
class Tool:
    name: str
    description: str
    input_schema: dict
    _fn: Any = field(repr=False)

    async def run(self, **kwargs) -> Any:
        import inspect
        if inspect.iscoroutinefunction(self._fn):
            return await self._fn(**kwargs)
        return self._fn(**kwargs)


class ToolRegistry:
    def __init__(self):
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool):
        self._tools[tool.name] = tool

    def has_tool(self, name: str) -> bool:
        return name in self._tools

    def tool_names(self) -> list[str]:
        return list(self._tools.keys())

    def list_tools(self) -> list[Tool]:
        return list(self._tools.values())

    async def execute(self, name: str, input_data: dict) -> Any:
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' not found")
        return await self._tools[name].run(**input_data)


# ── Global registry ────────────────────────────────────────────────────────
tool_registry = ToolRegistry()


def _register_all():
    from app.tools.web_search import web_search
    from app.tools.http_request import http_request
    from app.tools.code_exec import code_exec
    from app.tools.file_ops import file_read, file_write, file_list
    from app.tools.calculator import calculator
    from app.tools.datetime_tool import datetime_tool
    from app.tools.memory_tool import memory_store, memory_retrieve

    tool_registry.register(Tool(
        name="web_search",
        description="Search the web using DuckDuckGo. Returns titles, URLs, and snippets.",
        input_schema={"query": "string", "max_results": "int (default 5)"},
        _fn=web_search,
    ))
    tool_registry.register(Tool(
        name="http_request",
        description="Make an HTTP GET or POST request to any URL. Returns text/JSON content.",
        input_schema={"url": "string", "method": "GET|POST", "body": "dict (optional)"},
        _fn=http_request,
    ))
    tool_registry.register(Tool(
        name="code_exec",
        description="Execute Python code in a sandboxed subprocess. Returns stdout + stderr.",
        input_schema={"code": "string", "timeout": "int seconds (default 10)"},
        _fn=code_exec,
    ))
    tool_registry.register(Tool(
        name="file_read",
        description="Read contents of a file from the workspace directory.",
        input_schema={"path": "string (relative to workspace)"},
        _fn=file_read,
    ))
    tool_registry.register(Tool(
        name="file_write",
        description="Write content to a file in the workspace directory.",
        input_schema={"path": "string", "content": "string"},
        _fn=file_write,
    ))
    tool_registry.register(Tool(
        name="file_list",
        description="List files and directories in the workspace.",
        input_schema={"path": "string (relative, default '.')"},
        _fn=file_list,
    ))
    tool_registry.register(Tool(
        name="calculator",
        description="Evaluate mathematical expressions safely. Supports +,-,*,/,**,sqrt,sin,cos,log.",
        input_schema={"expression": "string"},
        _fn=calculator,
    ))
    tool_registry.register(Tool(
        name="datetime",
        description="Get current date/time, convert timezones, or calculate date differences.",
        input_schema={"operation": "now|diff|convert", "params": "dict"},
        _fn=datetime_tool,
    ))
    tool_registry.register(Tool(
        name="memory_store",
        description="Store a fact or note in persistent memory for later retrieval.",
        input_schema={"key": "string", "value": "string"},
        _fn=memory_store,
    ))
    tool_registry.register(Tool(
        name="memory_retrieve",
        description="Retrieve a previously stored fact from memory.",
        input_schema={"key": "string"},
        _fn=memory_retrieve,
    ))
