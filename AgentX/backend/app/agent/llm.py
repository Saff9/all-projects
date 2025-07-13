"""
Unified LLM client supporting OpenAI, Anthropic, Groq, and Ollama.
Automatically selects provider based on available API keys.
"""
from __future__ import annotations

import json
import httpx
from typing import AsyncGenerator, Optional
from dataclasses import dataclass
from app.config import settings

# Optional provider imports
try:
    from openai import AsyncOpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

try:
    from anthropic import AsyncAnthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False


@dataclass
class LLMMessage:
    role: str   # "user" | "assistant" | "system"
    content: str


@dataclass
class LLMResponse:
    content: str
    model: str
    provider: str
    input_tokens: int = 0
    output_tokens: int = 0


class LLMClient:
    """Unified async LLM client with automatic provider selection."""

    PROVIDER_MODELS = {
        "openai":    "gpt-4o-mini",       # fast + cheap
        "anthropic": "claude-3-haiku-20240307",  # fast + cheap
        "groq":      "llama3-70b-8192",   # free tier, very fast
        "ollama":    "llama3",
    }

    def __init__(self):
        self._openai: Optional[AsyncOpenAI] = None
        self._anthropic: Optional[AsyncAnthropic] = None

        if HAS_OPENAI and settings.OPENAI_API_KEY:
            self._openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if HAS_ANTHROPIC and settings.ANTHROPIC_API_KEY:
            self._anthropic = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    def _get_provider(self, preferred: Optional[str] = None) -> str:
        order = [preferred, settings.get_active_provider()]
        for p in order:
            if p == "openai" and self._openai:
                return "openai"
            if p == "anthropic" and self._anthropic:
                return "anthropic"
            if p == "groq" and settings.GROQ_API_KEY:
                return "groq"
            if p == "ollama" and settings.OLLAMA_BASE_URL:
                return "ollama"
        return "none"

    async def complete(
        self,
        messages: list[LLMMessage],
        system: str = "",
        provider: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096,
    ) -> LLMResponse:
        active = self._get_provider(provider)

        if active == "openai":
            return await self._openai_complete(messages, system, temperature, max_tokens)
        elif active == "anthropic":
            return await self._anthropic_complete(messages, system, temperature, max_tokens)
        elif active == "groq":
            return await self._groq_complete(messages, system, temperature, max_tokens)
        elif active == "ollama":
            return await self._ollama_complete(messages, system, temperature, max_tokens)
        else:
            # Demo mode – no API key configured
            return LLMResponse(
                content=json.dumps({
                    "thought": "No LLM provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GROQ_API_KEY, or OLLAMA_BASE_URL in .env",
                    "action": "none",
                    "action_input": {},
                }),
                model="demo",
                provider="demo",
            )

    async def _openai_complete(self, messages, system, temperature, max_tokens) -> LLMResponse:
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs += [{"role": m.role, "content": m.content} for m in messages]

        resp = await self._openai.chat.completions.create(
            model=self.PROVIDER_MODELS["openai"],
            messages=msgs,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return LLMResponse(
            content=resp.choices[0].message.content or "",
            model=resp.model,
            provider="openai",
            input_tokens=resp.usage.prompt_tokens if resp.usage else 0,
            output_tokens=resp.usage.completion_tokens if resp.usage else 0,
        )

    async def _anthropic_complete(self, messages, system, temperature, max_tokens) -> LLMResponse:
        resp = await self._anthropic.messages.create(
            model=self.PROVIDER_MODELS["anthropic"],
            system=system,
            messages=[{"role": m.role, "content": m.content} for m in messages],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = resp.content[0].text if resp.content else ""
        return LLMResponse(
            content=content,
            model=resp.model,
            provider="anthropic",
            input_tokens=resp.usage.input_tokens,
            output_tokens=resp.usage.output_tokens,
        )

    async def _groq_complete(self, messages, system, temperature, max_tokens) -> LLMResponse:
        """Groq uses OpenAI-compatible API."""
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs += [{"role": m.role, "content": m.content} for m in messages]

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                json={
                    "model": self.PROVIDER_MODELS["groq"],
                    "messages": msgs,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return LLMResponse(
                content=data["choices"][0]["message"]["content"],
                model=data["model"],
                provider="groq",
                input_tokens=data.get("usage", {}).get("prompt_tokens", 0),
                output_tokens=data.get("usage", {}).get("completion_tokens", 0),
            )

    async def _ollama_complete(self, messages, system, temperature, max_tokens) -> LLMResponse:
        msgs = []
        if system:
            msgs.append({"role": "system", "content": system})
        msgs += [{"role": m.role, "content": m.content} for m in messages]

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/chat",
                json={
                    "model": self.PROVIDER_MODELS["ollama"],
                    "messages": msgs,
                    "stream": False,
                    "options": {"temperature": temperature, "num_predict": max_tokens},
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return LLMResponse(
                content=data["message"]["content"],
                model=data.get("model", "ollama"),
                provider="ollama",
            )


# Singleton
llm_client = LLMClient()
