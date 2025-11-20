/**
 * ContextManager — Manages conversation context window
 * Handles token limits, summarization, and knowledge retrieval
 */
export class ContextManager {
    constructor(memoryStore) {
        this.memory = memoryStore;
        this.maxTokens = 8000; // Default context window size
        this.currentConversationId = null;
        this.messageHistory = []; // In-memory cache of current conversation
    }

    /**
     * Start a new conversation
     */
    async newConversation(title) {
        const conv = await this.memory.createConversation(title);
        this.currentConversationId = conv.id;
        this.messageHistory = [];
        return conv;
    }

    /**
     * Load an existing conversation
     */
    async loadConversation(id) {
        const conv = await this.memory.getConversation(id);
        if (!conv) throw new Error('Conversation not found');
        this.currentConversationId = id;
        this.messageHistory = await this.memory.getMessages(id);
        return conv;
    }

    /**
     * Add a message and persist it
     */
    async addMessage(role, content, metadata = {}) {
        if (!this.currentConversationId) {
            await this.newConversation();
        }

        const msg = await this.memory.addMessage(this.currentConversationId, role, content, metadata);
        this.messageHistory.push(msg);
        return msg;
    }

    /**
     * Build context for the AI (system prompt + relevant history)
     * Implements sliding window with summarization
     */
    buildContext(systemPrompt) {
        const messages = [{ role: 'system', content: systemPrompt }];

        // Estimate token count (rough: 1 token ≈ 4 chars)
        const estimateTokens = (text) => Math.ceil((text || '').length / 4);

        let tokenBudget = this.maxTokens - estimateTokens(systemPrompt);
        const recentMessages = [];

        // Walk backwards through history, adding messages until we hit the budget
        for (let i = this.messageHistory.length - 1; i >= 0; i--) {
            const msg = this.messageHistory[i];
            const tokens = estimateTokens(msg.content);

            if (tokenBudget - tokens < 0) {
                // Summarize the remaining older messages
                const olderMessages = this.messageHistory.slice(0, i + 1);
                if (olderMessages.length > 0) {
                    const summary = this._summarizeMessages(olderMessages);
                    messages.push({
                        role: 'system',
                        content: `[Previous conversation summary: ${summary}]`,
                    });
                }
                break;
            }

            tokenBudget -= tokens;
            recentMessages.unshift({ role: msg.role, content: msg.content });
        }

        messages.push(...recentMessages);
        return messages;
    }

    /**
     * Simple extractive summary of older messages
     */
    _summarizeMessages(messages) {
        const userMsgs = messages.filter(m => m.role === 'user');
        const aiMsgs = messages.filter(m => m.role === 'assistant');

        const topics = userMsgs
            .slice(-5)
            .map(m => m.content.slice(0, 80))
            .join('; ');

        const keyPoints = aiMsgs
            .slice(-3)
            .map(m => {
                // Extract first sentence
                const first = m.content.split(/[.!?]\s/)[0];
                return first?.slice(0, 100);
            })
            .filter(Boolean)
            .join('; ');

        return `User discussed: ${topics}. Key points: ${keyPoints || 'General discussion.'}`;
    }

    /**
     * Retrieve relevant knowledge for the current query
     */
    async getRelevantKnowledge(query) {
        if (!query) return [];
        const knowledge = await this.memory.searchKnowledge(query);
        return knowledge.slice(0, 5); // Top 5 relevant facts
    }

    /**
     * Extract and store knowledge from the conversation
     */
    async extractKnowledge(userMessage, aiResponse) {
        // Simple heuristic: if the AI response contains factual patterns, store them
        const factPatterns = [
            /(?:is|are|was|were|means?|refers? to|defined as)\s+(.{20,100})/i,
            /(?:the answer is|result is|equals?)\s+(.{5,100})/i,
        ];

        for (const pattern of factPatterns) {
            const match = aiResponse.match(pattern);
            if (match) {
                const topic = userMessage.slice(0, 50);
                const fact = match[0].slice(0, 200);
                await this.memory.addKnowledge(topic, fact, 'conversation');
                break; // Store at most one fact per exchange
            }
        }
    }

    /**
     * Get conversation title (auto-generate from first message)
     * Returns a getter function for compatibility with main.js usage
     */
    getTitle() {
        if (this.messageHistory.length === 0) return 'New Chat';
        const firstUser = this.messageHistory.find(m => m.role === 'user');
        if (!firstUser) return 'New Chat';
        return firstUser.content.slice(0, 50) + (firstUser.content.length > 50 ? '...' : '');
    }

    /**
     * Set max token window size
     */
    setMaxTokens(tokens) {
        this.maxTokens = Math.max(2000, Math.min(128000, tokens));
    }

    /**
     * Get current conversation ID
     */
    getCurrentId() {
        return this.currentConversationId;
    }

    /**
     * Get message count
     */
    getMessageCount() {
        return this.messageHistory.length;
    }
}
