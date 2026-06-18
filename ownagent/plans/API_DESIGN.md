# Apex Smart - API Design

## Overview

This document defines the RESTful API endpoints for Apex Smart. The API follows OpenAPI 3.0 specification and provides endpoints for chat, file management, provider configuration, and system management.

## Base URL

```
Development: http://localhost:8000
Production: https://api.genzsmart.app
```

## Authentication

Currently, the API uses a simple API key header for authentication. In future versions, JWT-based authentication will be supported.

```http
Authorization: Bearer {api_key}
```

## Response Format

All responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  }
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful request |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Provider unavailable |

---

## Endpoints

### 1. Health & System

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "timestamp": "2026-01-31T14:30:00Z",
    "providers": {
      "deepseek": "available",
      "claude": "available",
      "grok": "unavailable",
      "openai": "available"
    }
  }
}
```

#### GET /api/info
Get API information and capabilities.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Apex Smart API",
    "version": "1.0.0",
    "features": [
      "chat",
      "streaming",
      "file_upload",
      "web_search",
      "multi_provider"
    ],
    "providers": ["deepseek", "claude", "grok", "openai", "openrouter", "perplexity"]
  }
}
```

---

### 2. Chat Endpoints

#### GET /api/conversations
List all conversations.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |
| search | string | No | Search in conversation titles |

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123456",
        "title": "Python Programming Help",
        "provider": "claude",
        "model": "claude-3-sonnet",
        "message_count": 15,
        "created_at": "2026-01-31T10:00:00Z",
        "updated_at": "2026-01-31T14:00:00Z",
        "is_pinned": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

#### POST /api/conversations
Create a new conversation.

**Request Body:**
```json
{
  "title": "Optional Title",
  "provider": "claude",
  "model": "claude-3-sonnet",
  "system_prompt": "Optional custom system prompt"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_123456",
    "title": "New Conversation",
    "provider": "claude",
    "model": "claude-3-sonnet",
    "created_at": "2026-01-31T14:30:00Z",
    "updated_at": "2026-01-31T14:30:00Z"
  }
}
```

#### GET /api/conversations/{conversation_id}
Get a specific conversation with messages.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| conversation_id | string | Conversation UUID |

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| before_message_id | string | No | Get messages before this ID (pagination) |
| limit | integer | No | Number of messages (default: 50) |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conv_123456",
    "title": "Python Programming Help",
    "provider": "claude",
    "model": "claude-3-sonnet",
    "created_at": "2026-01-31T10:00:00Z",
    "updated_at": "2026-01-31T14:00:00Z",
    "messages": [
      {
        "id": "msg_001",
        "role": "system",
        "content": "You are Apex Smart...",
        "created_at": "2026-01-31T10:00:00Z",
        "tokens": 150
      },
      {
        "id": "msg_002",
        "role": "user",
        "content": "How do I use list comprehensions?",
        "created_at": "2026-01-31T10:01:00Z",
        "tokens": 12
      },
      {
        "id": "msg_003",
        "role": "assistant",
        "content": "List comprehensions are a concise way...",
        "created_at": "2026-01-31T10:01:05Z",
        "tokens": 85,
        "metadata": {
          "provider": "claude",
          "model": "claude-3-sonnet",
          "finish_reason": "stop"
        }
      }
    ]
  }
}
```

#### PATCH /api/conversations/{conversation_id}
Update conversation metadata.

**Request Body:**
```json
{
  "title": "New Title",
  "is_pinned": true
}
```

#### DELETE /api/conversations/{conversation_id}
Delete a conversation.

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

#### POST /api/conversations/{conversation_id}/messages
Send a message and get a response (non-streaming).

**Request Body:**
```json
{
  "content": "Explain quantum computing",
  "provider": "claude",
  "model": "claude-3-opus",
  "enable_search": false,
  "temperature": 0.7,
  "max_tokens": 2000,
  "file_ids": ["file_123", "file_456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_004",
      "role": "assistant",
      "content": "Quantum computing is...",
      "created_at": "2026-01-31T14:35:00Z",
      "tokens": 450,
      "metadata": {
        "provider": "claude",
        "model": "claude-3-opus",
        "finish_reason": "stop",
        "usage": {
          "prompt_tokens": 25,
          "completion_tokens": 450,
          "total_tokens": 475
        }
      }
    }
  }
}
```

#### POST /api/conversations/{conversation_id}/stream
Send a message and stream the response (Server-Sent Events).

**Request Headers:**
```http
Accept: text/event-stream
```

**Request Body:**
```json
{
  "content": "Write a Python function",
  "provider": "openai",
  "model": "gpt-4",
  "temperature": 0.7
}
```

**Response (SSE Stream):**
```
event: start
data: {"message_id": "msg_005", "timestamp": "2026-01-31T14:36:00Z"}

event: token
data: {"token": "Here's", "index": 0}

event: token
data: {"token": " a", "index": 1}

event: token
data: {"token": " Python", "index": 2}

event: done
data: {"finish_reason": "stop", "usage": {"total_tokens": 150}}
```

**Event Types:**
- `start`: Stream started, includes message ID
- `token`: Individual token/chunk
- `error`: Error occurred
- `done`: Stream complete

#### DELETE /api/conversations/{conversation_id}/messages/{message_id}
Delete a specific message and all subsequent messages.

---

### 3. Provider Endpoints

#### GET /api/providers
List all available AI providers and their status.

**Response:**
```json
{
  "success": true,
  "data": {
    "providers": [
      {
        "id": "deepseek",
        "name": "DeepSeek",
        "status": "available",
        "is_configured": true,
        "models": [
          {
            "id": "deepseek-chat",
            "name": "DeepSeek Chat",
            "supports_vision": false,
            "supports_streaming": true,
            "max_tokens": 8192
          },
          {
            "id": "deepseek-coder",
            "name": "DeepSeek Coder",
            "supports_vision": false,
            "supports_streaming": true,
            "max_tokens": 8192
          }
        ]
      },
      {
        "id": "claude",
        "name": "Claude (Anthropic)",
        "status": "available",
        "is_configured": true,
        "models": [
          {
            "id": "claude-3-opus",
            "name": "Claude 3 Opus",
            "supports_vision": true,
            "supports_streaming": true,
            "max_tokens": 4096
          },
          {
            "id": "claude-3-sonnet",
            "name": "Claude 3 Sonnet",
            "supports_vision": true,
            "supports_streaming": true,
            "max_tokens": 4096
          }
        ]
      },
      {
        "id": "grok",
        "name": "Grok (xAI)",
        "status": "unavailable",
        "is_configured": false,
        "error": "API key not configured",
        "models": []
      }
    ]
  }
}
```

#### GET /api/providers/{provider_id}/models
Get models for a specific provider.

#### POST /api/providers/{provider_id}/test
Test provider connectivity.

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": "claude",
    "status": "connected",
    "latency_ms": 245,
    "tested_at": "2026-01-31T14:40:00Z"
  }
}
```

---

### 4. File Endpoints

#### POST /api/files/upload
Upload a file for analysis.

**Request:**
```http
Content-Type: multipart/form-data
```

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | File to upload |
| conversation_id | string | No | Associate with conversation |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "filename": "document.pdf",
    "original_name": "My Document.pdf",
    "mime_type": "application/pdf",
    "size": 1048576,
    "status": "processing",
    "created_at": "2026-01-31T14:45:00Z"
  }
}
```

#### GET /api/files/{file_id}
Get file metadata.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "file_123",
    "filename": "document.pdf",
    "original_name": "My Document.pdf",
    "mime_type": "application/pdf",
    "size": 1048576,
    "status": "ready",
    "extracted_text": "Extracted content preview...",
    "word_count": 1250,
    "created_at": "2026-01-31T14:45:00Z",
    "conversations": ["conv_123"]
  }
}
```

#### GET /api/files/{file_id}/download
Download the original file.

#### DELETE /api/files/{file_id}
Delete a file.

#### GET /api/files
List uploaded files.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| conversation_id | string | Filter by conversation |
| status | string | Filter by status (processing, ready, error) |

---

### 5. Settings Endpoints

#### GET /api/settings
Get all user settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "general": {
      "theme": "dark",
      "language": "en",
      "font_size": "medium",
      "enter_to_send": true
    },
    "chat": {
      "default_provider": "claude",
      "default_model": "claude-3-sonnet",
      "temperature": 0.7,
      "max_tokens": 2000,
      "auto_save": true,
      "show_token_count": true
    },
    "providers": {
      "deepseek": {
        "api_key": "sk-****1234",
        "is_configured": true
      },
      "claude": {
        "api_key": "sk-****5678",
        "is_configured": true
      },
      "openai": {
        "api_key": null,
        "is_configured": false
      }
    },
    "features": {
      "web_search": {
        "enabled": true,
        "default_provider": "perplexity"
      },
      "file_upload": {
        "enabled": true,
        "max_file_size": 10485760,
        "allowed_types": ["pdf", "txt", "md", "csv", "json", "png", "jpg"]
      }
    }
  }
}
```

#### PATCH /api/settings
Update settings.

**Request Body:**
```json
{
  "general": {
    "theme": "light"
  },
  "chat": {
    "default_provider": "openai",
    "default_model": "gpt-4"
  }
}
```

#### PUT /api/settings/providers/{provider_id}
Configure a provider API key.

**Request Body:**
```json
{
  "api_key": "sk-...",
  "base_url": "https://api.custom.com"  // Optional, for custom endpoints
}
```

#### DELETE /api/settings/providers/{provider_id}
Remove provider configuration.

---

### 6. Memory Endpoints

#### GET /api/memory/facts
Get learned facts/preferences about the user.

**Response:**
```json
{
  "success": true,
  "data": {
    "facts": [
      {
        "id": "fact_001",
        "category": "preference",
        "content": "User prefers Python over JavaScript",
        "confidence": 0.85,
        "source_conversation": "conv_123",
        "created_at": "2026-01-30T10:00:00Z"
      }
    ]
  }
}
```

#### POST /api/memory/search
Search through conversation history.

**Request Body:**
```json
{
  "query": "Python list comprehensions",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "conversation_id": "conv_123",
        "conversation_title": "Python Help",
        "message_id": "msg_005",
        "content": "List comprehensions are...",
        "similarity": 0.92,
        "created_at": "2026-01-31T10:00:00Z"
      }
    ]
  }
}
```

---

## Data Models

### Conversation
```typescript
interface Conversation {
  id: string;
  title: string;
  provider: string;
  model: string;
  system_prompt?: string;
  message_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}
```

### Message
```typescript
interface Message {
  id: string;
  conversation_id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  attachments?: FileAttachment[];
  metadata?: {
    provider: string;
    model: string;
    finish_reason: string;
    usage?: TokenUsage;
    search_results?: SearchResult[];
  };
  tokens?: number;
  created_at: string;
}
```

### File
```typescript
interface File {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  extracted_text?: string;
  word_count?: number;
  error_message?: string;
  created_at: string;
}
```

### Provider
```typescript
interface Provider {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'unavailable' | 'degraded';
  is_configured: boolean;
  error?: string;
  models: Model[];
}

interface Model {
  id: string;
  name: string;
  description?: string;
  supports_vision: boolean;
  supports_streaming: boolean;
  supports_search: boolean;
  max_tokens: number;
  context_window: number;
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `INVALID_REQUEST` | Request validation failed |
| `CONVERSATION_NOT_FOUND` | Conversation doesn't exist |
| `MESSAGE_NOT_FOUND` | Message doesn't exist |
| `FILE_NOT_FOUND` | File doesn't exist |
| `FILE_TOO_LARGE` | Uploaded file exceeds size limit |
| `UNSUPPORTED_FILE_TYPE` | File type not supported |
| `PROVIDER_NOT_CONFIGURED` | Provider API key not set |
| `PROVIDER_UNAVAILABLE` | Provider API is down |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `STREAM_ERROR` | Error during streaming |
| `INSUFFICIENT_QUOTA` | Provider quota exceeded |
| `INVALID_API_KEY` | Invalid provider API key |

---

## Rate Limiting

Rate limits are applied per API key:

| Endpoint | Limit |
|----------|-------|
| /api/conversations/* | 100/minute |
| /api/conversations/*/stream | 20/minute |
| /api/files/upload | 10/minute |
| /api/providers/* | 60/minute |
| All others | 120/minute |

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706710800
```

---

## WebSocket (Future)

For real-time features like typing indicators and collaborative editing:

```
WS /ws/conversations/{conversation_id}
```

**Events:**
- `typing_start` / `typing_stop`
- `message_received`
- `message_updated`
- `user_joined` / `user_left`
