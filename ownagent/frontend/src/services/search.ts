import api from './api';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  published_date?: string;
  thumbnail?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total_results: number;
  search_time: number;
  provider: string;
  cached: boolean;
}

export interface SearchProvider {
  id: string;
  name: string;
  available: boolean;
}

export const searchApi = {
  /**
   * Perform a web search
   */
  async search(
    query: string,
    options: {
      provider?: string;
      numResults?: number;
      searchType?: 'general' | 'news' | 'images';
      useCache?: boolean;
    } = {}
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();
    params.append('query', query);
    
    if (options.provider) params.append('provider', options.provider);
    if (options.numResults) params.append('num_results', options.numResults.toString());
    if (options.searchType) params.append('search_type', options.searchType);
    if (options.useCache !== undefined) params.append('use_cache', options.useCache.toString());
    
    const response = await api.post(`/search?${params.toString()}`) as { data?: { data?: SearchResponse } };
    return response.data?.data || { results: [], query, total_results: 0, search_time: 0, provider: 'unknown', cached: false };
  },

  /**
   * Get available search providers
   */
  async getProviders(): Promise<SearchProvider[]> {
    const response = await api.get('/search/providers') as { data?: { data?: { providers?: SearchProvider[] } } };
    return response.data?.data?.providers || [];
  },

  /**
   * Clear search cache
   */
  async clearCache(): Promise<void> {
    await api.post('/search/cache/clear');
  },

  /**
   * Get search cache statistics
   */
  async getCacheStats(): Promise<{ total_entries: number; valid_entries: number; expired_entries: number }> {
    const response = await api.get('/search/cache/stats') as { data?: { data?: { total_entries: number; valid_entries: number; expired_entries: number } } };
    return response.data?.data || { total_entries: 0, valid_entries: 0, expired_entries: 0 };
  }
};

/**
 * Detect if a message might need web search
 */
export function detectSearchNeed(message: string): boolean {
  const searchKeywords = [
    'current', 'latest', 'news', 'today', 'weather',
    'price', 'stock', 'market', 'recent', 'update',
    'happening', 'now', '2024', '2025', '2026',
    'what is the', 'how to', 'who is', 'where is'
  ];
  
  const messageLower = message.toLowerCase();
  return searchKeywords.some(keyword => messageLower.includes(keyword));
}
