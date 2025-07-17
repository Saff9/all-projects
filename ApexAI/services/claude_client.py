import anthropic
from utils import config

client = anthropic.Anthropic(api_key=config.CLAUDE_API_KEY)

async def get_answer(query: str) -> str:
    """
    Uses Anthropic Claude API to get an answer.
    """
    try:
        response = client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=512,
            messages=[
                {"role": "system", "content": "You are GenzAI, created by Saffan from Kashmir."},
                {"role": "user", "content": query}
            ]
        )
        return response.content[0].text.strip()
    except Exception as e:
        print("Claude API Error:", e)
        return "Sorry, I couldn’t fetch the answer from Claude right now."
