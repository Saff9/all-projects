import api from './api';

export interface MemoryFact {
  id: string;
  category: 'preference' | 'fact' | 'skill' | 'goal' | 'personal_info';
  content: string;
  confidence: number;
  source_conversation?: string;
  created_at: string;
}

export interface MemorySearchResult {
  conversation_id: string;
  conversation_title: string;
  message_id: string;
  content: string;
  similarity: number;
  created_at: string;
}

export const memoryApi = {
  /**
   * Get all memory facts
   */
  async getFacts(category?: string): Promise<MemoryFact[]> {
    const params = category ? `?category=${category}` : '';
    const response = await api.get(`/memory/facts${params}`) as { data?: { data?: { facts?: MemoryFact[] } } };
    return response.data?.data?.facts || [];
  },

  /**
   * Add a new memory fact
   */
  async addFact(
    category: string,
    content: string,
    confidence: number = 1.0,
    conversationId?: string
  ): Promise<MemoryFact> {
    const params = new URLSearchParams();
    params.append('category', category);
    params.append('content', content);
    params.append('confidence', confidence.toString());
    if (conversationId) params.append('conversation_id', conversationId);
    
    const response = await api.post(`/memory/facts?${params.toString()}`) as { data?: { data?: MemoryFact } };
    return response.data?.data as MemoryFact;
  },

  /**
   * Delete a memory fact
   */
  async deleteFact(factId: string): Promise<void> {
    await api.delete(`/memory/facts/${factId}`);
  },

  /**
   * Search memories
   */
  async searchMemories(query: string, limit: number = 10): Promise<MemorySearchResult[]> {
    const response = await api.post('/memory/search', { query, limit }) as { data?: { data?: { results?: MemorySearchResult[] } } };
    return response.data?.data?.results || [];
  },

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{ total: number; by_category: Record<string, number> }> {
    const facts = await this.getFacts();
    const byCategory: Record<string, number> = {};
    
    facts.forEach(fact => {
      byCategory[fact.category] = (byCategory[fact.category] || 0) + 1;
    });
    
    return {
      total: facts.length,
      by_category: byCategory
    };
  }
};
