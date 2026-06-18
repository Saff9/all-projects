// Provider Types
export interface Provider {
  id: string;
  name: string;
  status: 'available' | 'unavailable';
  is_configured: boolean;
  error?: string;
  models: Model[];
}

export interface Model {
  id: string;
  name: string;
  supports_vision: boolean;
  supports_streaming: boolean;
  max_tokens: number;
}

// Message Types
export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  created_at: string;
  tokens?: number;
  metadata?: MessageMetadata;
  file_ids?: string[];
}

export interface MessageMetadata {
  provider: string;
  model: string;
  finish_reason: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Conversation Types
export interface Conversation {
  id: string;
  title: string;
  provider: string;
  model: string;
  message_count: number;
  created_at: string;
  updated_at: string;
  is_pinned: boolean;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

export interface ConversationCreateRequest {
  title?: string;
  provider: string;
  model: string;
  system_prompt?: string;
}

// File Types
export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: 'processing' | 'ready' | 'error';
  extracted_text?: string;
  word_count?: number;
  created_at: string;
  conversations?: string[];
}

// Settings Types
export interface Settings {
  general: GeneralSettings;
  chat: ChatSettings;
  providers: Record<string, ProviderSettings>;
  features: FeatureSettings;
}

export interface GeneralSettings {
  theme: 'dark' | 'light' | 'system';
  language: string;
  font_size: 'small' | 'medium' | 'large';
  enter_to_send: boolean;
}

export interface ChatSettings {
  default_provider: string;
  default_model: string;
  temperature: number;
  max_tokens: number;
  auto_save: boolean;
  show_token_count: boolean;
}

export interface ProviderSettings {
  api_key: string | null;
  is_configured: boolean;
  base_url?: string;
}

export interface FeatureSettings {
  web_search: {
    enabled: boolean;
    default_provider: string;
  };
  file_upload: {
    enabled: boolean;
    max_file_size: number;
    allowed_types: string[];
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: PaginationInfo;
}

// SSE Types
export interface StreamStartEvent {
  message_id: string;
  timestamp: string;
}

export interface StreamTokenEvent {
  token: string;
  index: number;
}

export interface StreamErrorEvent {
  error: string;
  code: string;
}

export interface StreamDoneEvent {
  finish_reason: string;
  usage?: {
    total_tokens: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

// Memory Types
export interface MemoryFact {
  id: string;
  category: string;
  content: string;
  confidence: number;
  source_conversation: string;
  created_at: string;
}

export interface MemorySearchResult {
  conversation_id: string;
  conversation_title: string;
  message_id: string;
  content: string;
  similarity: number;
  created_at: string;
}

// UI Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}