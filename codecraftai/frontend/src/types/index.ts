export interface Model {
  provider: string;
  model_id: string;
  display_name: string;
  type: 'text' | 'image' | 'video';
  description?: string;
  logo_url?: string;
  context_length?: number;
  cost_per_1k_tokens?: number;
  is_free?: boolean;
  capabilities?: string[];
  tier?: string;
}

export interface ChatThread {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  timestamp: number;
  model?: string;
  provider?: string;
  cost?: number;
  error?: string;
}

export interface GenerationResult {
  type: 'text' | 'image' | 'video';
  content: string;
  usage?: any;
  cost?: number;
}

export interface CustomProviderConfig {
  id: string;
  name: string;
  endpoint: string;
  api_key: string;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  badgeColor: string;
  enabled: boolean;
  iconName: string;
}

export interface MemoryFact {
  id: string;
  category: string;
  content: string;
  confidence: number;
  timestamp: number;
}

export interface SkillExecutionResult {
  results: Record<string, string>;
}
