import { BaseProvider } from './base-provider.js';

/**
 * Google Gemini Provider
 * API: https://generativelanguage.googleapis.com/v1beta
 */
export class GeminiProvider extends BaseProvider {
    constructor(config = {}) {
        super('Gemini', {
            baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
            defaultModel: 'gemini-2.0-flash',
            ...config,
        });
    }

    listModels() {
        return [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
            { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
            { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
        ];
    }

    _toGeminiMessages(messages) {
        const systemParts = [];
        const contents = [];

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemParts.push({ text: msg.content });
            } else if (msg.role === 'tool') {
                contents.push({
                    role: 'function',
                    parts: [{
                        functionResponse: {
                            name: msg.name || 'tool',
                            response: { result: msg.content },
                        },
                    }],
                });
            } else {
                const role = msg.role === 'assistant' ? 'model' : 'user';
                contents.push({
                    role,
                    parts: [{ text: msg.content }],
                });
            }
        }

        return { systemParts, contents };
    }

    _toGeminiTools(tools) {
        if (!tools?.length) return undefined;
        return [{
            functionDeclarations: tools.map(t => ({
                name: t.name,
                description: t.description,
                parameters: t.parameters || { type: 'OBJECT', properties: {} },
            })),
        }];
    }

    async chat(messages, options = {}) {
        const model = options.model || this.defaultModel;
        const { systemParts, contents } = this._toGeminiMessages(messages);

        const body = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens || 4096,
            },
        };

        if (systemParts.length) {
            body.systemInstruction = { parts: systemParts };
        }

        const tools = this._toGeminiTools(options.tools);
        if (tools) body.tools = tools;

        const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;
        const response = await this._fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Gemini error: ${data.error.message}`);
        }

        const candidate = data.candidates?.[0];
        if (!candidate) {
            throw new Error('Gemini: No response candidate');
        }

        let content = '';
        let toolCalls = [];

        for (const part of candidate.content.parts) {
            if (part.text) content += part.text;
            if (part.functionCall) {
                toolCalls.push({
                    id: `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                    name: part.functionCall.name,
                    arguments: part.functionCall.args || {},
                });
            }
        }

        return {
            content,
            toolCalls: toolCalls.length ? toolCalls : undefined,
            usage: data.usageMetadata,
            model,
            provider: this.name,
        };
    }

    async stream(messages, options = {}, onChunk = () => { }) {
        const model = options.model || this.defaultModel;
        const { systemParts, contents } = this._toGeminiMessages(messages);

        const body = {
            contents,
            generationConfig: {
                temperature: options.temperature ?? 0.7,
                maxOutputTokens: options.maxTokens || 4096,
            },
        };

        if (systemParts.length) {
            body.systemInstruction = { parts: systemParts };
        }

        const url = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
        const response = await this._fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
        });

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
                    try {
                        const parsed = JSON.parse(line.slice(6));
                        const parts = parsed.candidates?.[0]?.content?.parts || [];
                        for (const part of parts) {
                            if (part.text) {
                                fullContent += part.text;
                                onChunk(part.text);
                            }
                            if (part.functionCall) {
                                toolCalls.push({
                                    id: `gemini_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                                    name: part.functionCall.name,
                                    arguments: part.functionCall.args || {},
                                });
                            }
                        }
                    } catch { /* skip */ }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return {
            content: fullContent,
            toolCalls: toolCalls.length ? toolCalls : undefined,
            model,
            provider: this.name,
        };
    }
}
