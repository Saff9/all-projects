import os
import openai
from utils import config

openai.api_key = config.OPENAI_API_KEY

async def get_answer(query: str) -> str:
    """
    Uses OpenAI's GPT model to get an answer.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are GenzAI, an assistant made by Saffan from Kashmir."},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=512
        )
        return response.choices[0].message["content"].strip()
    except Exception as e:
        print("OpenAI API Error:", e)
        return "Sorry, I couldn’t fetch the answer from OpenAI right now."
