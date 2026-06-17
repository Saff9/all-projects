import { apiClient } from './api';
import type {
  Conversation,
  ConversationDetail,
  ConversationCreateRequest,
  ConversationsResponse,
  Message,
  PaginationInfo,
  StreamStartEvent,
  StreamTokenEvent,
  StreamErrorEvent,
  StreamDoneEvent,
} from '../types';

export interface SendMessageRequest {
  content: string;
  provider?: string;
  model?: string;
  enable_search?: boolean;
  temperature?: number;
  max_tokens?: number;
  file_ids?: string[];
}

export interface StreamCallbacks {
  onStart?: (data: StreamStartEvent) => void;
  onToken?: (data: StreamTokenEvent) => void;
  onError?: (data: StreamErrorEvent) => void;
  onDone?: (data: StreamDoneEvent) => void;
}

class ChatService {
  // Conversations
  async getConversations(
    page = 1,
    limit = 20,
    search?: string
  ): Promise<{ conversations: Conversation[]; pagination: PaginationInfo }> {
    const params: Record<string, unknown> = { page, limit };
    if (search) params.search = search;
    return apiClient.get<ConversationsResponse>('/conversations', params);
  }

  async getConversation(id: string): Promise<ConversationDetail> {
    return apiClient.get<ConversationDetail>(`/conversations/${id}`);
  }

  async createConversation(
    data: ConversationCreateRequest
  ): Promise<Conversation> {
    return apiClient.post<Conversation>('/conversations', data);
  }

  async updateConversation(
    id: string,
    data: { title?: string; is_pinned?: boolean }
  ): Promise<Conversation> {
    return apiClient.patch<Conversation>(`/conversations/${id}`, data);
  }

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  }

  // Messages
  async sendMessage(
    conversationId: string,
    data: SendMessageRequest
  ): Promise<Message> {
    const response = await apiClient.post<{ message: Message }>(
      `/conversations/${conversationId}/messages`,
      data
    );
    return response.message;
  }

  async deleteMessage(
    conversationId: string,
    messageId: string
  ): Promise<void> {
    await apiClient.delete(
      `/conversations/${conversationId}/messages/${messageId}`
    );
  }

  // Streaming
  async streamMessage(
    conversationId: string,
    data: SendMessageRequest,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `/conversations/${conversationId}/stream`;

    try {
      const response = await fetch(`${apiClient.instance.defaults.baseURL}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify(data),
        signal, // Support for AbortController
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      // Handle abort signal
      if (signal) {
        signal.addEventListener('abort', () => {
          reader.cancel();
        });
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          this.parseSSEEvent(line, callbacks);
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        this.parseSSEEvent(buffer, callbacks);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Handle abort gracefully
        callbacks.onError?.({
          error: 'Request was cancelled',
          code: 'ABORTED',
        });
      } else {
        console.error('Stream error:', error);
        callbacks.onError?.({
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'STREAM_ERROR',
        });
      }
    }
  }

  private parseSSEEvent(data: string, callbacks: StreamCallbacks): void {
    const lines = data.trim().split('\n');
    let event = '';
    let eventData = '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        eventData = line.slice(5).trim();
      }
    }

    if (!event || !eventData) return;

    try {
      const parsed = JSON.parse(eventData);

      switch (event) {
        case 'start':
          callbacks.onStart?.(parsed as StreamStartEvent);
          break;
        case 'token':
          callbacks.onToken?.(parsed as StreamTokenEvent);
          break;
        case 'error':
          callbacks.onError?.(parsed as StreamErrorEvent);
          break;
        case 'done':
          callbacks.onDone?.(parsed as StreamDoneEvent);
          break;
        default:
          // Unknown event type - log but don't crash
          console.warn(`Unknown SSE event type: ${event}`);
      }
    } catch (error) {
      console.error('Failed to parse SSE data:', error);
      // Propagate parsing error to caller
      callbacks.onError?.({
        error: error instanceof Error ? error.message : 'Failed to parse server response',
        code: 'PARSE_ERROR',
      });
    }
  }
}

export const chatService = new ChatService();
export default chatService;