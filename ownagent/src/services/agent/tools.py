"""
Agent tools registry for Apex Smart
Defines available tools the AI agent can use
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, List, Optional, Callable, Awaitable, Literal
from enum import Enum
import json


class ToolType(str, Enum):
    """Types of tools available"""
    SEARCH = "search"
    MEMORY = "memory"
    FILE = "file"
    CALCULATOR = "calculator"
    DATETIME = "datetime"


@dataclass
class ToolParameter:
    """Tool parameter definition"""
    name: str
    type: str
    description: str
    required: bool = True
    default: Any = None
    enum: Optional[List[str]] = None


@dataclass
class ToolDefinition:
    """Tool definition for agent"""
    name: str
    description: str
    parameters: List[ToolParameter]
    tool_type: ToolType
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for LLM function calling"""
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        p.name: {
                            "type": p.type,
                            "description": p.description,
                            **({"enum": p.enum} if p.enum else {})
                        }
                        for p in self.parameters
                    },
                    "required": [p.name for p in self.parameters if p.required]
                }
            }
        }


class BaseTool(ABC):
    """Base class for agent tools"""
    
    def __init__(self, definition: ToolDefinition):
        self.definition = definition
    
    @abstractmethod
    async def execute(self, **kwargs) -> Dict[str, Any]:
        """Execute the tool with given parameters"""
        pass
    
    def get_definition(self) -> Dict[str, Any]:
        """Get tool definition for LLM"""
        return self.definition.to_dict()


class SearchTool(BaseTool):
    """Web search tool"""
    
    def __init__(self):
        super().__init__(ToolDefinition(
            name="web_search",
            description="Search the web for current information, news, or facts",
            parameters=[
                ToolParameter(
                    name="query",
                    type="string",
                    description="The search query"
                ),
                ToolParameter(
                    name="num_results",
                    type="integer",
                    description="Number of results to return (1-10)",
                    required=False,
                    default=5
                ),
                ToolParameter(
                    name="search_type",
                    type="string",
                    description="Type of search",
                    required=False,
                    default="general",
                    enum=["general", "news", "images"]
                )
            ],
            tool_type=ToolType.SEARCH
        ))
    
    async def execute(self, query: str, num_results: int = 5, search_type: Literal["general", "news", "images"] = "general", **kwargs) -> Dict[str, Any]:
        """Execute web search"""
        from src.services.search import search_web
        from src.services.search.base import BaseSearchProvider
        
        try:
            response = await search_web(
                query=query,
                num_results=min(num_results, 10),
                search_type=search_type
            )
            
            # Format for context
            formatter = BaseSearchProvider.__new__(BaseSearchProvider)
            formatted = formatter.format_for_context(response)
            
            return {
                "success": True,
                "results": response.to_dict(),
                "formatted": formatted
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }


class MemoryTool(BaseTool):
    """Memory retrieval tool"""
    
    def __init__(self):
        super().__init__(ToolDefinition(
            name="retrieve_memory",
            description="Retrieve relevant information from user memory",
            parameters=[
                ToolParameter(
                    name="query",
                    type="string",
                    description="What to search for in memory"
                ),
                ToolParameter(
                    name="max_results",
                    type="integer",
                    description="Maximum number of memories to retrieve",
                    required=False,
                    default=5
                )
            ],
            tool_type=ToolType.MEMORY
        ))
    
    async def execute(self, query: str, max_results: int = 5, **kwargs) -> Dict[str, Any]:
        """Execute memory retrieval"""
        # Note: This requires a database session which should be passed in context
        # For now, return a placeholder
        return {
            "success": True,
            "message": "Memory retrieval requires database context. Use memory context builder instead.",
            "query": query
        }


class FileTool(BaseTool):
    """File processing tool"""
    
    def __init__(self):
        super().__init__(ToolDefinition(
            name="read_file",
            description="Read and extract content from uploaded files",
            parameters=[
                ToolParameter(
                    name="file_id",
                    type="string",
                    description="ID of the file to read"
                ),
                ToolParameter(
                    name="extract_text",
                    type="boolean",
                    description="Whether to extract text content",
                    required=False,
                    default=True
                )
            ],
            tool_type=ToolType.FILE
        ))
    
    async def execute(self, file_id: str, extract_text: bool = True, **kwargs) -> Dict[str, Any]:
        """Execute file reading"""
        # This would typically fetch from database and process
        return {
            "success": True,
            "message": f"File reading for ID: {file_id}. Requires database context.",
            "file_id": file_id
        }


class CalculatorTool(BaseTool):
    """Calculator tool for mathematical operations"""
    
    def __init__(self):
        super().__init__(ToolDefinition(
            name="calculate",
            description="Perform mathematical calculations",
            parameters=[
                ToolParameter(
                    name="expression",
                    type="string",
                    description="Mathematical expression to evaluate (e.g., '2 + 2', 'sqrt(16)')"
                )
            ],
            tool_type=ToolType.CALCULATOR
        ))
    
    async def execute(self, expression: str, **kwargs) -> Dict[str, Any]:
        """Execute calculation safely"""
        try:
            # Safe evaluation - only allow basic math operations
            allowed_names = {
                "abs": abs,
                "max": max,
                "min": min,
                "pow": pow,
                "round": round,
                "sum": sum
            }
            
            # Use eval with limited scope (safe for basic math)
            result = eval(expression, {"__builtins__": {}}, allowed_names)
            
            return {
                "success": True,
                "result": result,
                "expression": expression
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Calculation failed: {str(e)}"
            }


class DateTimeTool(BaseTool):
    """Date and time tool"""
    
    def __init__(self):
        super().__init__(ToolDefinition(
            name="get_datetime",
            description="Get current date and time information",
            parameters=[
                ToolParameter(
                    name="format",
                    type="string",
                    description="Output format",
                    required=False,
                    default="full",
                    enum=["full", "date", "time", "iso", "timestamp"]
                ),
                ToolParameter(
                    name="timezone",
                    type="string",
                    description="Timezone (e.g., 'UTC', 'America/New_York')",
                    required=False,
                    default="UTC"
                )
            ],
            tool_type=ToolType.DATETIME
        ))
    
    async def execute(self, format: str = "full", timezone: str = "UTC", **kwargs) -> Dict[str, Any]:
        """Get current datetime"""
        from datetime import datetime
        import pytz
        
        try:
            tz = pytz.timezone(timezone)
            now = datetime.now(tz)
        except:
            now = datetime.now()
        
        if format == "date":
            result = now.strftime("%Y-%m-%d")
        elif format == "time":
            result = now.strftime("%H:%M:%S")
        elif format == "iso":
            result = now.isoformat()
        elif format == "timestamp":
            result = int(now.timestamp())
        else:  # full
            result = now.strftime("%Y-%m-%d %H:%M:%S %Z")
        
        return {
            "success": True,
            "datetime": result,
            "format": format,
            "timezone": timezone
        }


class ToolRegistry:
    """Registry of available tools"""
    
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}
        self._register_default_tools()
    
    def _register_default_tools(self):
        """Register default tools"""
        self.register(SearchTool())
        self.register(MemoryTool())
        self.register(FileTool())
        self.register(CalculatorTool())
        self.register(DateTimeTool())
    
    def register(self, tool: BaseTool):
        """Register a tool"""
        self._tools[tool.definition.name] = tool
    
    def get_tool(self, name: str) -> Optional[BaseTool]:
        """Get a tool by name"""
        return self._tools.get(name)
    
    def list_tools(self) -> List[str]:
        """List all available tool names"""
        return list(self._tools.keys())
    
    def get_tool_definitions(self) -> List[Dict[str, Any]]:
        """Get all tool definitions for LLM"""
        return [tool.get_definition() for tool in self._tools.values()]
    
    async def execute_tool(self, tool_name: str, **kwargs) -> Dict[str, Any]:
        """Execute a tool by name"""
        tool = self.get_tool(tool_name)
        if not tool:
            return {
                "success": False,
                "error": f"Tool not found: {tool_name}"
            }
        
        return await tool.execute(**kwargs)


# Global registry instance
_registry: Optional[ToolRegistry] = None


def get_tool_registry() -> ToolRegistry:
    """Get or create global tool registry"""
    global _registry
    if _registry is None:
        _registry = ToolRegistry()
    return _registry
