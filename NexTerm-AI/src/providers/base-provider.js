/**
 * BaseProvider — Abstract AI provider interface
 * All providers must implement: chat(), stream(), listModels()
 */
export class BaseProvider {
    constructor(name, config = {}) {
        this.name = name;
        this.apiKey = config.apiKey || '';
        this.baseUrl = config.baseUrl || '';
        this.defaultModel = config.defaultModel || '';
        this.maxRetries = config.maxRetries || 2;
        this.timeout = config.timeout || 30000;
        this.healthy = true;
        this.lastError = null;
        this.latency = 0;
        this.requestCount = 0;
    }

    /**
     * Send a chat completion request
     * @param {Array} messages - [{role: 'user'|'assistant'|'system', content: string}]
     * @param {Object} options - {model, temperature, maxTokens, tools}
     * @returns {Promise<{content: string, toolCalls?: Array, usage?: Object}>}
     */
    async chat(messages, options = {}) {
        throw new Error(`${this.name}: chat() not implemented`);
    }

    /**
     * Stream a chat completion
     * @param {Array} messages
     * @param {Object} options
     * @param {Function} onChunk - Called with each text chunk
     * @returns {Promise<{content: string, toolCalls?: Array}>}
     */
    async stream(messages, options = {}, onChunk = () => { }) {
        // Default: fall back to non-streaming
        const result = await this.chat(messages, options);
        onChunk(result.content);
        return result;
    }

    /**
     * List available models for this provider
     * @returns {Array<{id: string, name: string}>}
     */
    listModels() {
        return [];
    }

    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * Make an HTTP request with timeout and retry
     */
    async _fetch(url, options = {}, retries = this.maxRetries) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeout);

        try {
            const start = Date.now();
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
            this.latency = Date.now() - start;
            this.requestCount++;

            if (!response.ok) {
                const errorBody = await response.text().catch(() => '');
                const err = new Error(`${this.name} API error ${response.status}: ${errorBody}`);
                err.status = response.status;
                err.retryable = response.status >= 500 || response.status === 429;
                throw err;
            }

            this.healthy = true;
            this.lastError = null;
            return response;
        } catch (err) {
            if (err.name === 'AbortError') {
                err.message = `${this.name}: Request timed out after ${this.timeout}ms`;
                err.retryable = true;
            }

            if (retries > 0 && err.retryable) {
                const backoff = (this.maxRetries - retries + 1) * 1000;
                await new Promise(r => setTimeout(r, backoff));
                return this._fetch(url, options, retries - 1);
            }

            this.healthy = false;
            this.lastError = err.message;
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    /**
     * Parse an SSE stream
     */
    async _parseSSE(response, onChunk) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';
        let toolCalls = [];

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const data = line.slice(6).trim();
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const result = this._extractSSEChunk(parsed);
                        if (result.content) {
                            fullContent += result.content;
                            onChunk(result.content);
                        }
                        if (result.toolCalls) {
                            toolCalls = toolCalls.concat(result.toolCalls);
                        }
                    } catch { /* skip non-JSON lines */ }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return { content: fullContent, toolCalls: toolCalls.length ? toolCalls : undefined };
    }

    /**
     * Override in subclasses to extract content from SSE chunk
     */
    _extractSSEChunk(parsed) {
        const delta = parsed.choices?.[0]?.delta || {};
        return {
            content: delta.content || '',
            toolCalls: delta.tool_calls,
        };
    }

    /**
     * Format tools for this provider's API (OpenAI-compatible by default)
     */
    _formatTools(tools) {
        if (!tools || !tools.length) return undefined;
        return tools.map(t => ({
            type: 'function',
            function: {
                name: t.name,
                description: t.description,
                parameters: t.parameters || { type: 'object', properties: {} },
            },
        }));
    }
}
