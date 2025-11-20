import { GroqProvider } from './groq-provider.js';
import { GeminiProvider } from './gemini-provider.js';
import { PerplexityProvider } from './perplexity-provider.js';
import { OpenAIProvider } from './openai-provider.js';

/**
 * ProviderManager — Manages all AI providers with fallback chain
 */
export class ProviderManager {
    constructor() {
        this.providers = new Map();
        this.fallbackOrder = ['groq', 'gemini', 'openai', 'perplexity'];
        this._activeProvider = null;
        this._activeModel = null;

        // Register built-in providers
        this._registerDefaults();
    }

    /**
     * Get the active provider ID
     */
    get activeProvider() {
        return this._activeProvider;
    }

    /**
     * Set the active provider ID
     */
    set activeProvider(value) {
        this._activeProvider = value;
    }

    /**
     * Get the active model
     */
    get activeModel() {
        return this._activeModel;
    }

    /**
     * Set the active model (used for direct assignment in settings)
     */
    set activeModel(value) {
        this._activeModel = value;
    }

    _registerDefaults() {
        this.providers.set('groq', new GroqProvider());
        this.providers.set('gemini', new GeminiProvider());
        this.providers.set('perplexity', new PerplexityProvider());
        this.providers.set('openai', new OpenAIProvider());
        this.providers.set('openrouter', new OpenAIProvider({
            name: 'OpenRouter',
            baseUrl: 'https://openrouter.ai/api/v1',
            defaultModel: 'openai/gpt-4o-mini',
        }));
    }

    /**
     * Configure a provider with an API key
     */
    setApiKey(providerId, apiKey) {
        const provider = this.providers.get(providerId);
        if (provider) {
            provider.apiKey = apiKey;
        }
    }

    /**
     * Set the active provider and model
     */
    setActive(providerId, model = null) {
        const provider = this.providers.get(providerId);
        if (!provider) throw new Error(`Unknown provider: ${providerId}`);
        if (!provider.isConfigured()) throw new Error(`${provider.name}: No API key configured`);
        this.activeProvider = providerId;
        this.activeModel = model || provider.defaultModel;
    }

    /**
     * Get the currently active provider instance
     */
    getActive() {
        if (!this.activeProvider) {
            // Auto-select first configured provider
            for (const id of this.fallbackOrder) {
                const p = this.providers.get(id);
                if (p?.isConfigured()) {
                    this.activeProvider = id;
                    this.activeModel = p.defaultModel;
                    break;
                }
            }
        }
        if (!this.activeProvider) return null;
        return this.providers.get(this.activeProvider);
    }

    /**
     * Get active model
     */
    getActiveModel() {
        return this.activeModel;
    }

    /**
     * Chat with automatic fallback
     */
    async chat(messages, options = {}) {
        const errors = [];
        const order = this._getFallbackOrder();

        for (const providerId of order) {
            const provider = this.providers.get(providerId);
            if (!provider?.isConfigured() || !provider.healthy) continue;

            try {
                const model = providerId === this.activeProvider ? this.activeModel : provider.defaultModel;
                return await provider.chat(messages, { ...options, model });
            } catch (err) {
                errors.push(`${provider.name}: ${err.message}`);
                console.warn(`[ProviderManager] ${provider.name} failed:`, err.message);
            }
        }

        throw new Error(
            `All providers failed:\n${errors.map(e => `  • ${e}`).join('\n')}`
        );
    }

    /**
     * Stream with automatic fallback
     */
    async stream(messages, options = {}, onChunk = () => { }) {
        const errors = [];
        const order = this._getFallbackOrder();

        for (const providerId of order) {
            const provider = this.providers.get(providerId);
            if (!provider?.isConfigured() || !provider.healthy) continue;

            try {
                const model = providerId === this.activeProvider ? this.activeModel : provider.defaultModel;
                return await provider.stream(messages, { ...options, model }, onChunk);
            } catch (err) {
                errors.push(`${provider.name}: ${err.message}`);
                console.warn(`[ProviderManager] ${provider.name} stream failed:`, err.message);
            }
        }

        throw new Error(
            `All providers failed:\n${errors.map(e => `  • ${e}`).join('\n')}`
        );
    }

    /**
     * Get fallback order (active provider first, then rest)
     */
    _getFallbackOrder() {
        if (!this.activeProvider) return [...this.fallbackOrder];
        const order = [this.activeProvider];
        for (const id of this.fallbackOrder) {
            if (id !== this.activeProvider) order.push(id);
        }
        // Add any providers not in the fallback order
        for (const id of this.providers.keys()) {
            if (!order.includes(id)) order.push(id);
        }
        return order;
    }

    /**
     * Get all providers with their status
     */
    getStatus() {
        const status = [];
        for (const [id, provider] of this.providers) {
            status.push({
                id,
                name: provider.name,
                configured: provider.isConfigured(),
                healthy: provider.healthy,
                active: id === this.activeProvider,
                latency: provider.latency,
                requests: provider.requestCount,
                models: provider.listModels(),
                lastError: provider.lastError,
            });
        }
        return status;
    }

    /**
     * Set the fallback order
     */
    setFallbackOrder(order) {
        this.fallbackOrder = order;
    }

    /**
     * Load configuration from stored settings
     */
    loadConfig(config) {
        if (!config) return;

        // Set API keys
        for (const [id, apiKey] of Object.entries(config.apiKeys || {})) {
            this.setApiKey(id, apiKey);
        }

        // Set active provider
        if (config.activeProvider) {
            try {
                this.setActive(config.activeProvider, config.activeModel);
            } catch { /* provider not configured yet */ }
        }

        // Set fallback order
        if (config.fallbackOrder) {
            this.setFallbackOrder(config.fallbackOrder);
        }
    }

    /**
     * Export configuration (without API keys — those are encrypted separately)
     */
    exportConfig() {
        return {
            activeProvider: this.activeProvider,
            activeModel: this.activeModel,
            fallbackOrder: this.fallbackOrder,
        };
    }
}
