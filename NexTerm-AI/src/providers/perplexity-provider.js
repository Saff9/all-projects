import { BaseProvider } from './base-provider.js';

/**
 * Perplexity Provider — Web-grounded AI answers
 * API: https://api.perplexity.ai/chat/completions (OpenAI-compatible)
 */
export class PerplexityProvider extends BaseProvider {
    constructor(config = {}) {
        super('Perplexity', {
            baseUrl: 'https://api.perplexity.ai',
            defaultModel: 'sonar',
            ...config,
        });
    }

    listModels() {
        return [
            { id: 'sonar', name: 'Sonar (Fast)' },
            { id: 'sonar-pro', name: 'Sonar Pro (Deep)' },
            { id: 'sonar-reasoning', name: 'Sonar Reasoning' },
        ];
    }

    async chat(messages, options = {}) {
        const model = options.model || this.defaultModel;
        const body = {
            model,
            messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens || 4096,
            stream: false,
        };

        const response = await this._fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.apiKey}` },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const choice = data.choices[0];

        return {
            content: choice.message.content || '',
            citations: data.citations,
            usage: data.usage,
            model,
            provider: this.name,
        };
    }

    async stream(messages, options = {}, onChunk = () => { }) {
        const model = options.model || this.defaultModel;
        const body = {
            model,
            messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens || 4096,
            stream: true,
        };

        const response = await this._fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.apiKey}` },
            body: JSON.stringify(body),
        });

        const result = await this._parseSSE(response, onChunk);
        return { ...result, model, provider: this.name };
    }
}
