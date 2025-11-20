/**
 * MemoryStore — IndexedDB-backed persistent memory
 * Stores conversations, summaries, and knowledge facts
 */

const DB_NAME = 'nexterm_memory';
const DB_VERSION = 1;

export class MemoryStore {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = (e) => {
                const db = e.target.result;

                // Conversations store
                if (!db.objectStoreNames.contains('conversations')) {
                    const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
                    convStore.createIndex('createdAt', 'createdAt');
                    convStore.createIndex('title', 'title');
                }

                // Messages store
                if (!db.objectStoreNames.contains('messages')) {
                    const msgStore = db.createObjectStore('messages', { keyPath: 'id' });
                    msgStore.createIndex('conversationId', 'conversationId');
                    msgStore.createIndex('timestamp', 'timestamp');
                }

                // Knowledge store (key facts extracted from conversations)
                if (!db.objectStoreNames.contains('knowledge')) {
                    const knowStore = db.createObjectStore('knowledge', { keyPath: 'id' });
                    knowStore.createIndex('topic', 'topic');
                    knowStore.createIndex('createdAt', 'createdAt');
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            req.onsuccess = (e) => {
                this.db = e.target.result;
                resolve();
            };

            req.onerror = () => reject(new Error('Failed to open IndexedDB'));
        });
    }

    // ── Conversations ──

    async createConversation(title = 'New Chat') {
        const conv = {
            id: `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            title,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            messageCount: 0,
            summary: '',
        };
        await this._put('conversations', conv);
        return conv;
    }

    async getConversation(id) {
        return this._get('conversations', id);
    }

    async listConversations() {
        return this._getAll('conversations', 'createdAt');
    }

    async updateConversation(id, updates) {
        const conv = await this._get('conversations', id);
        if (!conv) return;
        Object.assign(conv, updates, { updatedAt: new Date().toISOString() });
        await this._put('conversations', conv);
        return conv;
    }

    async deleteConversation(id) {
        // Delete conversation and its messages
        const messages = await this.getMessages(id);
        const tx = this.db.transaction(['conversations', 'messages'], 'readwrite');
        tx.objectStore('conversations').delete(id);
        for (const msg of messages) {
            tx.objectStore('messages').delete(msg.id);
        }
        return new Promise((resolve) => { tx.oncomplete = resolve; });
    }

    // ── Messages ──

    async addMessage(conversationId, role, content, metadata = {}) {
        const msg = {
            id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            conversationId,
            role,
            content,
            timestamp: new Date().toISOString(),
            ...metadata,
        };
        await this._put('messages', msg);

        // Update conversation
        const conv = await this._get('conversations', conversationId);
        if (conv) {
            conv.messageCount = (conv.messageCount || 0) + 1;
            conv.updatedAt = msg.timestamp;
            // Auto-title from first user message
            if (conv.messageCount === 1 && role === 'user') {
                conv.title = content.slice(0, 60) + (content.length > 60 ? '...' : '');
            }
            await this._put('conversations', conv);
        }

        return msg;
    }

    async getMessages(conversationId) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction('messages', 'readonly');
            const idx = tx.objectStore('messages').index('conversationId');
            const req = idx.getAll(conversationId);
            req.onsuccess = () => resolve(req.result.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)));
            req.onerror = () => reject(req.error);
        });
    }

    // ── Knowledge ──

    async addKnowledge(topic, fact, source = '') {
        const entry = {
            id: `know_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            topic,
            fact,
            source,
            createdAt: new Date().toISOString(),
        };
        await this._put('knowledge', entry);
        return entry;
    }

    async searchKnowledge(query) {
        const all = await this._getAll('knowledge');
        const q = query.toLowerCase();
        return all.filter(k =>
            k.topic.toLowerCase().includes(q) ||
            k.fact.toLowerCase().includes(q)
        );
    }

    async getAllKnowledge() {
        return this._getAll('knowledge', 'createdAt');
    }

    // ── Settings ──

    async getSetting(key, defaultValue = null) {
        const entry = await this._get('settings', key);
        return entry ? entry.value : defaultValue;
    }

    async setSetting(key, value) {
        await this._put('settings', { key, value });
    }

    // ── Stats ──

    async getStats() {
        const conversations = await this._getAll('conversations');
        const knowledge = await this._getAll('knowledge');

        let totalMessages = 0;
        for (const conv of conversations) {
            totalMessages += conv.messageCount || 0;
        }

        return {
            conversations: conversations.length,
            messages: totalMessages,
            knowledge: knowledge.length,
        };
    }

    // ── Clear ──

    async clearAll() {
        const stores = ['conversations', 'messages', 'knowledge'];
        const tx = this.db.transaction(stores, 'readwrite');
        for (const store of stores) {
            tx.objectStore(store).clear();
        }
        return new Promise((resolve) => { tx.oncomplete = resolve; });
    }

    // ── Additional Methods for Full Compatibility ──

    /**
     * Get all messages for a conversation (alias for getMessages)
     */
    async getConversationMessages(conversationId) {
        return this.getMessages(conversationId);
    }

    /**
     * Save a full conversation with its messages (for import)
     */
    async saveConversation(id, conversationData) {
        const existing = await this._get('conversations', id);
        if (existing) {
            // Update existing
            Object.assign(existing, conversationData, { updatedAt: new Date().toISOString() });
            await this._put('conversations', existing);
        } else {
            // Create new
            await this._put('conversations', {
                id,
                title: conversationData.title || 'Imported Chat',
                createdAt: conversationData.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                messageCount: conversationData.messageCount || (conversationData.messages?.length || 0),
                summary: conversationData.summary || '',
            });
        }

        // Save messages
        if (conversationData.messages) {
            for (const msg of conversationData.messages) {
                await this._put('messages', {
                    id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    conversationId: id,
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp || new Date().toISOString(),
                });
            }
        }
    }

    // ── Internal helpers ──

    _put(storeName, data) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readwrite');
            tx.objectStore(storeName).put(data);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    _get(storeName, key) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).get(key);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    }

    _getAll(storeName, indexName = null) {
        return new Promise((resolve, reject) => {
            const tx = this.db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const req = indexName ? store.index(indexName).getAll() : store.getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => reject(req.error);
        });
    }
}
