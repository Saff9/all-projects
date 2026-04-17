# Pricing per 1k tokens (input/output).
PRICING = {
    "groq/llama3-8b-8192": {"input": 0.0005, "output": 0.0008},
    "groq/mixtral-8x7b-32768": {"input": 0.0007, "output": 0.0010},
    "groq/llama3-70b-8192": {"input": 0.0008, "output": 0.0012},
    "cerebras/llama3.1-8b": {"input": 0.0001, "output": 0.0002},
    "cerebras/llama3.1-70b": {"input": 0.0005, "output": 0.0008},
    "nvidia/meta/llama-3.1-70b-instruct": {"input": 0.0008, "output": 0.0012},
    "nvidia/nvidia/neva-22b": {"input": 0.0015, "output": 0.0025},
    "openrouter/anthropic/claude-3.5-sonnet": {"input": 0.003, "output": 0.015},
    "openrouter/openai/gpt-4o": {"input": 0.0025, "output": 0.010},
    "openrouter/google/gemini-pro-1.5": {"input": 0.0025, "output": 0.0075},
    "gemini/gemini-1.5-flash-latest": {"input": 0.00035, "output": 0.0007},
    "gemini/gemini-1.5-pro-latest": {"input": 0.00125, "output": 0.0025},
    "huggingface/black-forest-labs/FLUX.1-schnell": {"input": 0.005, "output": 0.005},
    "huggingface/meta-llama/Meta-Llama-3-8B-Instruct": {"input": 0.0005, "output": 0.0008},
    "deepseek/deepseek-chat": {"input": 0.00014, "output": 0.00028},
    "deepseek/deepseek-coder": {"input": 0.00028, "output": 0.00056},
}

def calculate_cost(model_identifier: str, usage: dict) -> float:
    pricing = PRICING.get(model_identifier, {"input": 0.0005, "output": 0.001}) # fallback default pricing
    cost = (usage.get("prompt_tokens", 0) * pricing["input"] +
            usage.get("completion_tokens", 0) * pricing["output"]) / 1000.0
    return round(cost, 6)
