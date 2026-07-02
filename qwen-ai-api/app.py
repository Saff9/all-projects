from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import os

app = FastAPI(title="AI API (Render Free)")

generator = pipeline(
    "text-generation",
    model="distilgpt2",
    device=-1
)

class Prompt(BaseModel):
    prompt: str

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/generate")
def generate(data: Prompt):
    result = generator(
        data.prompt,
        max_new_tokens=60,
        do_sample=True,
        temperature=0.7
    )
    return {"response": result[0]["generated_text"]}
