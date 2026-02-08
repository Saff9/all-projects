export type ModelProvider = 'groq' | 'huggingface' | 'openrouter' | 'search';

export type ModelPrefix = 'g:' | 'hf:' | 'or:' | 'web:';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: Citation[];
  isError?: boolean;
  feedback?: 'up' | 'down' | null;
}

export interface Citation {
  title: string;
  url: string;
  snippet: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  prefix: ModelPrefix;
  description: string;
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Fast',
    provider: 'groq',
    prefix: 'g:',
    description: 'Lightning fast responses'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Instant',
    provider: 'groq',
    prefix: 'g:',
    description: 'Ultra-fast smaller model'
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Balanced',
    provider: 'groq',
    prefix: 'g:',
    description: 'Good balance of speed and quality'
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct',
    name: 'Creative',
    provider: 'huggingface',
    prefix: 'hf:',
    description: 'Creative open model'
  },
  {
    id: 'google/gemma-2-27b-it',
    name: 'Light',
    provider: 'openrouter',
    prefix: 'or:',
    description: 'Lightweight and efficient'
  },
  {
    id: 'web-search',
    name: 'Search',
    provider: 'search',
    prefix: 'web:',
    description: 'Search the web for answers'
  }
];

export function getProviderFromPrefix(model: string): { provider: ModelProvider; modelId: string } {
  if (model.startsWith('g:')) {
    return { provider: 'groq', modelId: model.slice(2) };
  }
  if (model.startsWith('hf:')) {
    return { provider: 'huggingface', modelId: model.slice(3) };
  }
  if (model.startsWith('or:')) {
    return { provider: 'openrouter', modelId: model.slice(3) };
  }
  if (model.startsWith('web:')) {
    return { provider: 'search', modelId: model.slice(4) };
  }
  return { provider: 'groq', modelId: model };
}
