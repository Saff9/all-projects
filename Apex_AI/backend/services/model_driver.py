# backend/services/model_driver.py

import httpx
from config import settings


async def call_groq(model: str, prompt: str):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.GROQ_API_KEY}"}

    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.4,
        "stream": False,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=body, headers=headers)
        data = res.json()

    return data["choices"][0]["message"]["content"]


async def call_huggingface(model: str, prompt: str):
    url = f"https://api-inference.huggingface.co/models/{model}"
    headers = {"Authorization": f"Bearer {settings.HF_API_KEY}"}
    payload = {"inputs": prompt}

    async with httpx.AsyncClient() as client:
        res = await client.post(url, headers=headers, json=payload)
        data = res.json()

    if isinstance(data, list) and "generated_text" in data[0]:
        return data[0]["generated_text"]

    return str(data)


async def call_openrouter(model: str, prompt: str):
    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"}

    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=body, headers=headers)
        data = res.json()

    return data["choices"][0]["message"]["content"]
