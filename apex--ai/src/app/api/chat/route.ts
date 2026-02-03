import { NextRequest, NextResponse } from 'next/server';
import { getProviderFromPrefix } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  model: string;
  apiKeys?: {
    groq?: string;
    huggingface?: string;
    openrouter?: string;
    search?: string;
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  rate_limit: "Taking a quick breather! Please try again in a moment.",
  api_key_missing: "Service temporarily unavailable. Please try again or add your own API key in Settings.",
  api_error: "Something went wrong. Please try again in a moment.",
  network_error: "Connection issue. Please check your internet and try again.",
  invalid_request: "Something went wrong with your request. Please try again.",
  timeout: "Request took too long. Please try with a shorter message.",
  all_failed: "All services are busy. Please try again later or add your own API key in Settings.",
  unknown: "Something went wrong. Please try again.",
};

function getUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    
    if (msg.includes('all providers failed') || msg.includes('all_failed')) {
      return ERROR_MESSAGES.all_failed;
    }
    if (msg.includes('rate limit') || msg.includes('429')) {
      return ERROR_MESSAGES.rate_limit;
    }
    if (msg.includes('api key') || msg.includes('unauthorized') || msg.includes('401')) {
      return ERROR_MESSAGES.api_key_missing;
    }
    if (msg.includes('timeout') || msg.includes('timed out')) {
      return ERROR_MESSAGES.timeout;
    }
    if (msg.includes('network') || msg.includes('fetch')) {
      return ERROR_MESSAGES.network_error;
    }
    if (msg.includes('invalid') || msg.includes('400')) {
      return ERROR_MESSAGES.invalid_request;
    }
  }
  return ERROR_MESSAGES.unknown;
}

async function callGroq(messages: ChatMessage[], modelId: string, customKey?: string): Promise<string> {
  const apiKey = customKey || process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('NO_KEY: Groq API key not available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new Error('RATE_LIMIT: Rate limit exceeded');
      }
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED: Invalid API key');
      }
      throw new Error(`API_ERROR: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT: Request timed out');
    }
    throw error;
  }
}

async function callHuggingFace(messages: ChatMessage[], modelId: string, customKey?: string): Promise<string> {
  const apiKey = customKey || process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error('NO_KEY: HuggingFace API key not available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new Error('RATE_LIMIT: Rate limit exceeded');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHORIZED: Invalid API key');
      }
      if (response.status === 503) {
        throw new Error('MODEL_LOADING: Model is loading, please retry');
      }
      throw new Error(`API_ERROR: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT: Request timed out');
    }
    throw error;
  }
}

async function callOpenRouter(messages: ChatMessage[], modelId: string, customKey?: string): Promise<string> {
  const apiKey = customKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('NO_KEY: OpenRouter API key not available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://apex-ai.vercel.app',
        'X-Title': 'Apex AI',
      },
      body: JSON.stringify({
        model: modelId,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        max_tokens: 4096,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 429) {
        throw new Error('RATE_LIMIT: Rate limit exceeded');
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error('UNAUTHORIZED: Invalid API key');
      }
      throw new Error(`API_ERROR: ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'No response generated';
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('TIMEOUT: Request timed out');
    }
    throw error;
  }
}

interface ProviderResult {
  content: string;
  provider: string;
  fallback?: boolean;
}

async function callWithFallback(
  messages: ChatMessage[],
  apiKeys?: ChatRequest['apiKeys']
): Promise<ProviderResult> {
  const providers = [
    { 
      name: 'groq', 
      call: () => callGroq(messages, 'llama-3.3-70b-versatile', apiKeys?.groq),
      hasKey: !!(apiKeys?.groq || process.env.GROQ_API_KEY)
    },
    { 
      name: 'huggingface', 
      call: () => callHuggingFace(messages, 'Qwen/Qwen2.5-72B-Instruct', apiKeys?.huggingface),
      hasKey: !!(apiKeys?.huggingface || process.env.HF_API_KEY)
    },
    { 
      name: 'openrouter', 
      call: () => callOpenRouter(messages, 'google/gemma-2-27b-it', apiKeys?.openrouter),
      hasKey: !!(apiKeys?.openrouter || process.env.OPENROUTER_API_KEY)
    },
  ];

  const availableProviders = providers.filter(p => p.hasKey);
  
  if (availableProviders.length === 0) {
    throw new Error('API_KEY_MISSING: No API keys available');
  }

  const errors: string[] = [];
  
  for (let i = 0; i < availableProviders.length; i++) {
    const provider = availableProviders[i];
    try {
      console.log(`Trying provider: ${provider.name}`);
      const content = await provider.call();
      return { 
        content, 
        provider: provider.name,
        fallback: i > 0 
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.log(`Provider ${provider.name} failed: ${errorMsg}`);
      errors.push(`${provider.name}: ${errorMsg}`);
      continue;
    }
  }

  throw new Error(`ALL_FAILED: All providers failed`);
}

async function performWebSearch(
  query: string, 
  apiKeys?: ChatRequest['apiKeys']
): Promise<{ content: string; citations: Array<{ title: string; url: string; snippet: string }> }> {
  const searchApiKey = apiKeys?.search || process.env.SEARCH_API_KEY;
  
  if (!searchApiKey) {
    return {
      content: `Web search is not available right now. Please try again later or add your Serper API key in Settings.`,
      citations: []
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const searchResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': searchApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query, num: 5 }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!searchResponse.ok) {
      throw new Error('Search service temporarily unavailable');
    }

    const searchData = await searchResponse.json();
    const results = searchData.organic || [];
    
    const citations = results.map((r: { title: string; link: string; snippet: string }) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet,
    }));

    const context = results.map((r: { title: string; snippet: string }, i: number) => 
      `[${i + 1}] ${r.title}\n${r.snippet}`
    ).join('\n\n');

    const summaryMessages: ChatMessage[] = [
      { role: 'system', content: 'You are a helpful assistant. Summarize the search results and provide a comprehensive answer. Cite sources using [1], [2], etc.' },
      { role: 'user', content: `Question: ${query}\n\nSearch Results:\n${context}` }
    ];

    try {
      const result = await callWithFallback(summaryMessages, apiKeys);
      return { content: result.content, citations };
    } catch {
      return {
        content: `Here's what I found:\n\n${context}`,
        citations
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    return {
      content: `I couldn't complete the web search right now. ${errorMsg.includes('abort') ? 'The search took too long.' : 'Please try again in a moment.'}`,
      citations: []
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, model, apiKeys } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: ERROR_MESSAGES.invalid_request, code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    const { provider, modelId } = getProviderFromPrefix(model || 'g:llama-3.3-70b-versatile');

    let content: string;
    let citations: Array<{ title: string; url: string; snippet: string }> | undefined;

    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are Apex AI, a helpful, fast, and friendly assistant. You provide clear, accurate, and concise responses. When providing code, always format it properly in markdown code blocks with the language specified. You were developed by Saffan from Kashmir, India.'
    };

    const messagesWithSystem = [systemMessage, ...messages];

    if (provider === 'search') {
      const lastUserMessage = messages.filter(m => m.role === 'user').pop();
      const searchResult = await performWebSearch(lastUserMessage?.content || '', apiKeys);
      content = searchResult.content;
      citations = searchResult.citations;
    } else {
      try {
        switch (provider) {
          case 'groq':
            content = await callGroq(messagesWithSystem, modelId, apiKeys?.groq);
            break;
          case 'huggingface':
            content = await callHuggingFace(messagesWithSystem, modelId, apiKeys?.huggingface);
            break;
          case 'openrouter':
            content = await callOpenRouter(messagesWithSystem, modelId, apiKeys?.openrouter);
            break;
          default:
            content = await callGroq(messagesWithSystem, 'llama-3.3-70b-versatile', apiKeys?.groq);
        }
      } catch {
        console.log(`Primary provider ${provider} failed, trying fallback chain...`);
        const fallbackResult = await callWithFallback(messagesWithSystem, apiKeys);
        content = fallbackResult.content;
      }
    }

    return NextResponse.json({ 
      content,
      citations,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    const userMessage = getUserFriendlyError(error);
    
    return NextResponse.json(
      { error: userMessage, code: 'ERROR' },
      { status: 500 }
    );
  }
}
