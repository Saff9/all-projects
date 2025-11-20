import { BaseProvider } from './base-provider.js';

/**
 * Groq Provider — Ultra-fast LLM inference
 * API: https://api.groq.com/openai/v1/chat/completions
 */
export class GroqProvider extends BaseProvider {
    constructor(config = {}) {
        super('Groq', {
            baseUrl: 'https://api.groq.com/openai/v1',
            defaultModel: 'llama-3.3-70b-versatile',
            ...config,
        });
    }

    listModels() {
        return [
            { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
            { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B (Fast)' },
            { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B' },
            { id: 'gemma2-9b-it', name: 'Gemma 2 9B' },
        ];
    }

    async chat(messages, options = {}) {
        const model = options.model || this.defaultModel;
        const body = {
            model,
            messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 4096,
            stream: false,
        };

        if (options.tools?.length) {
            body.tools = this._formatTools(options.tools);
            body.tool_choice = 'auto';
        }

        const response = await this._fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.apiKey}` },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        const choice = data.choices[0];

        return {
            content: choice.message.content || '',
            toolCalls: choice.message.tool_calls?.map(tc => ({
                id: tc.id,
                name: tc.function.name,
                arguments: JSON.parse(tc.function.arguments || '{}'),
            })),
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
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 4096,
            stream: true,
        };

        if (options.tools?.length) {
            body.tools = this._formatTools(options.tools);
            body.tool_choice = 'auto';
        }

        const response = await this._fetch(`${this.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${this.apiKey}` },
            body: JSON.stringify(body),
        });

        const result = await this._parseSSE(response, onChunk);
        return { ...result, model, provider: this.name };
    }
}
