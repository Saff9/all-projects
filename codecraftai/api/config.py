import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
HUGGINGFACE_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# Custom providers as JSON string: [{"name":"MyProvider","endpoint":"https://...","api_key":"key"}]
CUSTOM_PROVIDERS = os.getenv("CUSTOM_PROVIDERS", "[]")

ALLOWED_EMAIL = os.getenv("ALLOWED_EMAIL", "saffanakbar942@gmail.com")
