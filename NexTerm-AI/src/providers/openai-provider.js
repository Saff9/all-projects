import { BaseProvider } from './base-provider.js';

/**
 * OpenAI-compatible Provider 
 * Works with: OpenAI, OpenRouter, Ollama, Together AI, etc.
 */
export class OpenAIProvider extends BaseProvider {
    constructor(config = {}) {
        super(config.name || 'OpenAI', {
            baseUrl: config.baseUrl || 'https://api.openai.com/v1',
            defaultModel: config.defaultModel || 'gpt-4o-mini',
            ...config,
        });
    }

    listModels() {
        // Default models — user can override via settings
        if (this.baseUrl.includes('openai.com')) {
            return [
                { id: 'gpt-4o', name: 'GPT-4o' },
                { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
                { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
                { id: 'o3-mini', name: 'o3-mini (Reasoning)' },
            ];
        }
        if (this.baseUrl.includes('openrouter.ai')) {
            return [
                { id: 'openai/gpt-4o', name: 'GPT-4o (OpenRouter)' },
                { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
                { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash' },
                { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' },
            ];
        }
        return [{ id: this.defaultModel, name: this.defaultModel }];
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
