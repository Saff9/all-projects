import asyncio
from playwright.async_api import async_playwright

async def scrape_answer(query: str) -> str:
    """
    Scrapes Perplexity AI for an answer to the given query.
    Returns the top response text or a fallback message.
    """
    try:
        async with async_playwright() as p:
            browser = await p.firefox.launch(headless=True)
            page = await browser.new_page()
            
            # Open Perplexity search page
            await page.goto("https://www.perplexity.ai/")
            await page.fill("textarea", query)
            await page.keyboard.press("Enter")

            # Wait for the answer container to load
            await page.wait_for_selector("div.prose", timeout=15000)

            # Extract the text of the first AI response
            content = await page.inner_text("div.prose")
            await browser.close()

            return content.strip() if content else "No response found."
    except Exception as e:
        print("Perplexity scrape failed:", e)
        return "Sorry, couldn't fetch from Perplexity right now."
