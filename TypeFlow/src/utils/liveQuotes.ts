
export async function fetchLiveQuote(difficulty: string): Promise<string> {
  try {
    const cacheKey = `live_quote_${difficulty}`;
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(`${cacheKey}_time`);
    
    if (cached && cacheTime && Date.now() - parseInt(cacheTime) < 3600000) { // 1hr
      return cached;
    }

    const response = await fetch('https://api.quotable.io/random?tags=technology|science|inspirational');
    if (!response.ok) throw new Error('API fail');
    
    const data = await response.json();
    const quote = `${data.content} — ${data.author}`;
    
    localStorage.setItem(cacheKey, quote);
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
    
    return quote;
  } catch (error) {
    console.warn('Live quote fail:', error);
    return 'Live quotes temporarily unavailable - using cached inspirational text.';
  }
}

