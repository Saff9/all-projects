"""
AgentX Core Runner – Plan → Execute → Reflect loop with SSE streaming.
"""
from __future__ import annotations

import json
import re
import asyncio
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional
from dataclasses import dataclass, field

from app.agent.llm import llm_client, LLMMessage
from app.agent.prompts import AGENT_SYSTEM_PROMPT, TOOL_DESC_TEMPLATE
from app.tools.registry import tool_registry
from app.config import settings


@dataclass
class AgentEvent:
    type: str        # thought | tool_call | tool_result | answer | error | status
    data: dict

    def to_sse(self) -> str:
        return f"data: {json.dumps({'type': self.type, **self.data})}\n\n"


@dataclass
class ConversationTurn:
    role: str
    content: str


class AgentRunner:
    """
    Autonomous ReAct agent with streaming SSE output.
    Compatible with OpenClaw / Claude agent mode pattern.
    """

    def __init__(self):
        self.registry = tool_registry

    def _build_system_prompt(self) -> str:
        tool_descs = "\n".join(
            TOOL_DESC_TEMPLATE.format(
                name=t.name,
                description=t.description,
                input_schema=json.dumps(t.input_schema),
            )
            for t in self.registry.list_tools()
        )
        return AGENT_SYSTEM_PROMPT.format(
            tool_descriptions=tool_descs,
            max_steps=settings.MAX_AGENT_STEPS,
            current_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        )

    def _parse_llm_json(self, content: str) -> dict:
        """Extract JSON from LLM response, handling markdown code blocks."""
        # Strip markdown code fences
        cleaned = re.sub(r"```(?:json)?\s*", "", content).replace("```", "").strip()
        # Find first { ... }
        match = re.search(r"\{[\s\S]*\}", cleaned)
        if match:
            return json.loads(match.group())
        return json.loads(cleaned)

    async def run_stream(
        self,
        message: str,
        history: list[ConversationTurn] | None = None,
        session_id: Optional[str] = None,
    ) -> AsyncGenerator[AgentEvent, None]:
        """
        Run the agent and yield SSE-compatible events.
        This is the main entry point for the chat endpoint.
        """
        history = history or []
        system = self._build_system_prompt()

        # Build message history for LLM
        messages: list[LLMMessage] = []
        for turn in history[-8:]:   # keep last 8 turns for context
            messages.append(LLMMessage(role=turn.role, content=turn.content))
        messages.append(LLMMessage(role="user", content=message))

        yield AgentEvent("status", {"message": "🤔 Agent thinking…", "step": 0})

        step = 0
        observation_log = ""

        while step < settings.MAX_AGENT_STEPS:
            step += 1

            # Compose current message with observations folded in
            current_messages = messages.copy()
            if observation_log:
                # Append observations as an assistant continuation
                current_messages.append(LLMMessage(
                    role="assistant",
                    content=observation_log,
                ))
                current_messages.append(LLMMessage(
                    role="user",
                    content="Continue based on the observation above.",
                ))

            try:
                response = await asyncio.wait_for(
                    llm_client.complete(
                        messages=current_messages,
                        system=system,
                        temperature=0.3,
                    ),
                    timeout=settings.AGENT_TIMEOUT_SECONDS,
                )
            except asyncio.TimeoutError:
                yield AgentEvent("error", {"message": "LLM request timed out"})
                return
            except Exception as exc:
                yield AgentEvent("error", {"message": f"LLM error: {exc}"})
                return

            # Parse LLM response
            try:
                parsed = self._parse_llm_json(response.content)
            except (json.JSONDecodeError, ValueError):
                # LLM returned non-JSON – treat as final answer
                yield AgentEvent("answer", {
                    "content": response.content,
                    "steps": step,
                })
                return

            thought = parsed.get("thought", "")
            action = parsed.get("action", "final_answer")
            action_input = parsed.get("action_input", {})

            # Emit thought
            if thought:
                yield AgentEvent("thought", {
                    "content": thought,
                    "step": step,
                    "model": response.model,
                    "provider": response.provider,
                })

            # ── Final answer ──────────────────────────────────────────────
            if action == "final_answer":
                answer_text = action_input.get("answer", response.content)
                yield AgentEvent("answer", {
                    "content": answer_text,
                    "steps": step,
                    "tokens_in": response.input_tokens,
                    "tokens_out": response.output_tokens,
                })
                return

            # ── Tool call ─────────────────────────────────────────────────
            yield AgentEvent("tool_call", {
                "tool": action,
                "input": action_input,
                "step": step,
            })

            if not self.registry.has_tool(action):
                obs = f"Error: Tool '{action}' not found. Available: {self.registry.tool_names()}"
                yield AgentEvent("tool_result", {
                    "tool": action,
                    "result": obs,
                    "success": False,
                    "step": step,
                })
                observation = obs
            else:
                try:
                    result = await asyncio.wait_for(
                        self.registry.execute(action, action_input),
                        timeout=30,
                    )
                    obs_content = result if isinstance(result, str) else json.dumps(result, default=str)
                    # Truncate very long results
                    if len(obs_content) > 3000:
                        obs_content = obs_content[:3000] + "\n... [truncated]"
                    yield AgentEvent("tool_result", {
                        "tool": action,
                        "result": obs_content,
                        "success": True,
                        "step": step,
                    })
                    observation = f"Observation from {action}:\n{obs_content}"
                except asyncio.TimeoutError:
                    observation = f"Tool '{action}' timed out after 30 seconds."
                    yield AgentEvent("tool_result", {
                        "tool": action,
                        "result": observation,
                        "success": False,
                        "step": step,
                    })
                except Exception as exc:
                    observation = f"Tool '{action}' raised an error: {exc}"
                    yield AgentEvent("tool_result", {
                        "tool": action,
                        "result": observation,
                        "success": False,
                        "step": step,
                    })

            # Build running observation log for next LLM call
            observation_log = (
                f"Thought: {thought}\n"
                f"Action: {action}\n"
                f"Action Input: {json.dumps(action_input)}\n"
                f"{observation}\n"
            )

        # Exceeded max steps
        yield AgentEvent("error", {
            "message": f"Reached maximum steps ({settings.MAX_AGENT_STEPS}) without a final answer.",
        })


# Singleton
agent_runner = AgentRunner()
