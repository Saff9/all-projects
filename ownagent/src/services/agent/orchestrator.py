"""
Agent orchestrator for Apex Smart
Coordinates AI interactions with tools, memory, and context
"""
from typing import List, Dict, Any, Optional, AsyncIterator
from dataclasses import dataclass, field
from datetime import datetime
import json

from src.services.ai import (
    BaseAIProvider,
    ChatCompletionRequest,
    ChatCompletionResponse,
    Message,
    MessageRole,
    StreamChunk
)
from src.services.agent.tools import get_tool_registry, ToolRegistry, BaseTool
from src.services.memory import ConversationMemoryManager
from src.services.search import search_web
from sqlalchemy.orm import Session


@dataclass
class AgentContext:
    """Context for agent execution"""
    conversation_id: Optional[str] = None
    user_message: str = ""
    system_prompt: str = ""
    enable_search: bool = False
    enable_memory: bool = True
    attached_files: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AgentResponse:
    """Response from agent"""
    content: str
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    search_results: Optional[Dict[str, Any]] = None
    memory_used: bool = False
    files_processed: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


class AgentOrchestrator:
    """
    Main agent orchestrator that coordinates:
    - Tool usage (search, memory, files)
    - Context management
    - Response synthesis
    """
    
    def __init__(
        self,
        provider: BaseAIProvider,
        db: Optional[Session] = None,
        enable_tools: bool = True
    ):
        self.provider = provider
        self.db = db
        self.enable_tools = enable_tools
        self.tool_registry = get_tool_registry() if enable_tools else None
        self.memory_manager = None
        
        if db:
            self.memory_manager = ConversationMemoryManager(db)
    
    def _build_system_prompt(self, context: AgentContext) -> str:
        """Build enhanced system prompt with memory and capabilities"""
        base_prompt = context.system_prompt or "You are a helpful AI assistant."
        
        # Add memory context if enabled
        if self.memory_manager and context.enable_memory:
            memory_context = self.memory_manager.context_builder.build_memory_context(
                query=context.user_message,
                max_facts=5
            )
            if memory_context:
                base_prompt += f"\n\n{memory_context}"
        
        # Add tool capabilities
        if self.enable_tools and self.tool_registry:
            base_prompt += """

You have access to the following tools:
- web_search: Search the web for current information
- calculate: Perform mathematical calculations
- get_datetime: Get current date and time

When you need to use a tool, indicate it clearly in your response."""
        
        return base_prompt
    
    async def _perform_search(self, query: str) -> Optional[Dict[str, Any]]:
        """Perform web search if needed"""
        try:
            response = await search_web(query=query, num_results=5)
            return response.to_dict()
        except Exception as e:
            print(f"Search failed: {e}")
            return None
    
    def _detect_search_need(self, message: str) -> bool:
        """Detect if message requires web search"""
        search_keywords = [
            "current", "latest", "news", "today", "weather",
            "price", "stock", "market", "recent", "update",
            "happening", "now", "2024", "2025", "2026"
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in search_keywords)
    
    async def process_message(
        self,
        context: AgentContext,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AgentResponse:
        """
        Process a user message through the agent pipeline
        
        Args:
            context: Agent context
            history: Previous conversation history
            
        Returns:
            Agent response
        """
        # Initialize response
        agent_response = AgentResponse(content="")
        
        # Check if search is needed
        search_results = None
        if context.enable_search or self._detect_search_need(context.user_message):
            search_results = await self._perform_search(context.user_message)
            agent_response.search_results = search_results
        
        # Build messages for AI
        messages = []
        
        # Add system prompt
        system_prompt = self._build_system_prompt(context)
        messages.append(Message(role=MessageRole.SYSTEM, content=system_prompt))
        
        # Add search results as context if available
        if search_results and search_results.get("results"):
            search_context = self._format_search_context(search_results)
            messages.append(Message(
                role=MessageRole.SYSTEM,
                content=f"Recent web search results:\n{search_context}"
            ))
        
        # Add conversation history
        if history:
            for msg in history[-10:]:  # Last 10 messages
                role = MessageRole.USER if msg.get("role") == "user" else MessageRole.ASSISTANT
                messages.append(Message(role=role, content=msg.get("content", "")))
        
        # Add current user message
        messages.append(Message(role=MessageRole.USER, content=context.user_message))
        
        # Create completion request
        request = ChatCompletionRequest(
            messages=messages,
            model=self.provider.default_model,
            temperature=0.7,
            max_tokens=2000,
            stream=False
        )
        
        # Get AI response
        try:
            completion = await self.provider.chat_complete(request)
            agent_response.content = completion.content
            
            # Extract and execute any tool calls from response
            if self.enable_tools:
                tool_results = await self._process_tool_calls(completion.content)
                if tool_results:
                    agent_response.tool_calls = tool_results
                    
                    # If tools were called, get a final response
                    if any(r.get("executed") for r in tool_results):
                        final_content = await self._synthesize_with_tools(
                            context, messages, tool_results
                        )
                        agent_response.content = final_content
            
        except Exception as e:
            agent_response.content = f"I apologize, but I encountered an error: {str(e)}"
        
        # Extract memories from user message
        if self.memory_manager:
            try:
                facts = self.memory_manager.extract_and_store(
                    context.user_message,
                    role="user"
                )
                if facts:
                    agent_response.memory_used = True
            except Exception as e:
                print(f"Memory extraction failed: {e}")
        
        return agent_response
    
    def _format_search_context(self, search_results: Dict[str, Any]) -> str:
        """Format search results for AI context"""
        lines = []
        results = search_results.get("results", [])
        
        for i, result in enumerate(results[:5], 1):
            lines.append(f"{i}. {result.get('title', 'No title')}")
            lines.append(f"   Source: {result.get('source', 'Unknown')}")
            lines.append(f"   {result.get('snippet', 'No snippet')}")
            lines.append("")
        
        return "\n".join(lines)
    
    async def _process_tool_calls(self, content: str) -> List[Dict[str, Any]]:
        """Process and execute tool calls from AI response"""
        results = []
        
        if not self.tool_registry:
            return results
        
        # Simple pattern matching for tool calls
        # In production, use structured function calling
        import re
        
        # Look for search requests
        search_pattern = r'(?:search|look up|find)\s+(?:for\s+)?["\']?([^"\']+)["\']?'
        for match in re.finditer(search_pattern, content, re.IGNORECASE):
            query = match.group(1)
            tool_result = await self.tool_registry.execute_tool(
                "web_search",
                query=query,
                num_results=3
            )
            results.append({
                "tool": "web_search",
                "query": query,
                "result": tool_result,
                "executed": tool_result.get("success", False)
            })
        
        # Look for calculation requests
        calc_pattern = r'(?:calculate|compute|what is)\s+([\d\+\-\*\/\(\)\.\s]+)'
        for match in re.finditer(calc_pattern, content, re.IGNORECASE):
            expression = match.group(1).strip()
            if expression:
                tool_result = await self.tool_registry.execute_tool(
                    "calculate",
                    expression=expression
                )
                results.append({
                    "tool": "calculate",
                    "expression": expression,
                    "result": tool_result,
                    "executed": tool_result.get("success", False)
                })
        
        return results
    
    async def _synthesize_with_tools(
        self,
        context: AgentContext,
        messages: List[Message],
        tool_results: List[Dict[str, Any]]
    ) -> str:
        """Get final response after tool execution"""
        # Add tool results to messages
        tool_content = "Tool execution results:\n"
        for result in tool_results:
            if result.get("executed"):
                tool_content += f"\n{result['tool']}: {json.dumps(result['result'], indent=2)}\n"
        
        messages.append(Message(role=MessageRole.SYSTEM, content=tool_content))
        messages.append(Message(
            role=MessageRole.SYSTEM,
            content="Based on the tool results above, provide a helpful response to the user."
        ))
        
        # Get final response
        request = ChatCompletionRequest(
            messages=messages,
            model=self.provider.default_model,
            temperature=0.7,
            max_tokens=2000
        )
        
        completion = await self.provider.chat_complete(request)
        return completion.content
    
    async def stream_message(
        self,
        context: AgentContext,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncIterator[str]:
        """
        Stream a response from the agent
        
        Args:
            context: Agent context
            history: Previous conversation history
            
        Yields:
            Response chunks
        """
        # For streaming, we do a simpler version without tool execution
        messages = []
        
        # Add system prompt
        system_prompt = self._build_system_prompt(context)
        messages.append(Message(role=MessageRole.SYSTEM, content=system_prompt))
        
        # Add search results if available
        if context.enable_search:
            search_results = await self._perform_search(context.user_message)
            if search_results:
                search_context = self._format_search_context(search_results)
                messages.append(Message(
                    role=MessageRole.SYSTEM,
                    content=f"Recent web search results:\n{search_context}"
                ))
        
        # Add history
        if history:
            for msg in history[-10:]:
                role = MessageRole.USER if msg.get("role") == "user" else MessageRole.ASSISTANT
                messages.append(Message(role=role, content=msg.get("content", "")))
        
        # Add user message
        messages.append(Message(role=MessageRole.USER, content=context.user_message))
        
        # Stream response
        request = ChatCompletionRequest(
            messages=messages,
            model=self.provider.default_model,
            temperature=0.7,
            max_tokens=2000,
            stream=True
        )
        
        stream = await self.provider.chat_complete_stream(request)
        async for chunk in stream:
            yield chunk.content


def create_agent(
    provider: BaseAIProvider,
    db: Optional[Session] = None,
    enable_tools: bool = True
) -> AgentOrchestrator:
    """Factory function to create an agent orchestrator"""
    return AgentOrchestrator(provider, db, enable_tools)
