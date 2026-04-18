import httpx
from bs4 import BeautifulSoup
from markdownify import markdownify as md

async def scrape_url_to_markdown(url: str) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(url, follow_redirects=True)
        soup = BeautifulSoup(response.text, 'html.parser')
        # Remove scripts and styles
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside']):
            tag.decompose()
        body = soup.find('body') or soup
        markdown = md(str(body), heading_style="ATX")
        return markdown[:100000]  # limit to 100k chars
