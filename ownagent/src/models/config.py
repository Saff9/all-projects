"""
Model configuration for the Local AI System
"""

SUPPORTED_MODELS = [
    "qwen2.5-coder:1.5b-base",
    "qwen2.5-coder:3b",
    "qwen2.5-coder:latest",
    "deepseek-coder:6.7b-instruct-q4_0",
    # Note: deepseek-v3.1:671b-cloud is not locally runnable
]

DEFAULT_MODEL = "qwen2.5-coder:3b"

OLLAMA_BASE_URL = "http://localhost:11434"

# API settings
API_HOST = "0.0.0.0"
API_PORT = 8000