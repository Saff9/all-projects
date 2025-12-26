# To Kit - API Endpoint Specifications

## Overview
This document defines the complete API specification for the To Kit platform. The API follows RESTful principles with JSON:API specification for consistency and scalability.

## API Design Principles

### Standards
- **Versioning**: URL-based versioning (`/api/v1/`)
- **Format**: JSON:API specification
- **Authentication**: Bearer token (JWT)
- **Content-Type**: `application/vnd.api+json`
- **Error Format**: JSON:API error objects

### Response Structure
```json
{
  "data": {
    "type": "resource-type",
    "id": "resource-id",
    "attributes": { /* resource attributes */ },
    "relationships": { /* related resources */ }
  },
  "included": [ /* related resources */ ],
  "meta": { /* pagination, rate limits, etc. */ },
  "links": { /* pagination links */ }
}
```

## Authentication Endpoints

### 1. POST /api/v1/auth/register
**Purpose**: User registration

**Request Body**:
```json
{
  "data": {
    "type": "users",
    "attributes": {
      "email": "user@example.com",
      "username": "username",
      "password": "securepassword",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "type": "users",
    "id": "user-uuid",
    "attributes": {
      "email": "user@example.com",
      "username": "username",
      "first_name": "John",
      "last_name": "Doe",
      "email_verified": false,
      "is_active": true,
      "role": "user",
      "created_at": "2026-02-24T16:33:34.431Z"
    }
  },
  "meta": {
    "verification_required": true
  }
}
```

### 2. POST /api/v1/auth/login
**Purpose**: User login

**Request Body**:
```json
{
  "data": {
    "type": "auth",
    "attributes": {
      "email": "user@example.com",
      "password": "securepassword"
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "type": "auth",
    "id": "auth-session-id",
    "attributes": {
      "access_token": "jwt-access-token",
      "refresh_token": "jwt-refresh-token",
      "token_type": "bearer",
      "expires_in": 900,
      "user": {
        "id": "user-uuid",
        "email": "user@example.com",
        "username": "username"
      }
    }
  }
}
```

### 3. POST /api/v1/auth/refresh
**Purpose**: Refresh access token

**Request Body**:
```json
{
  "data": {
    "type": "auth",
    "attributes": {
      "refresh_token": "jwt-refresh-token"
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "type": "auth",
    "id": "auth-session-id",
    "attributes": {
      "access_token": "new-jwt-access-token",
      "refresh_token": "new-jwt-refresh-token",
      "token_type": "bearer",
      "expires_in": 900
    }
  }
}
```

### 4. POST /api/v1/auth/logout
**Purpose**: User logout

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "auth",
    "id": "logout-id",
    "attributes": {
      "message": "Logout successful"
    }
  }
}
```

## User Management Endpoints

### 5. GET /api/v1/users/me
**Purpose**: Get current user profile

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "users",
    "id": "user-uuid",
    "attributes": {
      "email": "user@example.com",
      "username": "username",
      "first_name": "John",
      "last_name": "Doe",
      "avatar_url": "https://cdn.example.com/avatars/user-uuid.jpg",
      "email_verified": true,
      "is_active": true,
      "role": "user",
      "created_at": "2026-02-24T16:33:34.431Z",
      "last_login_at": "2026-02-24T16:33:34.431Z"
    },
    "relationships": {
      "profile": {
        "data": {
          "type": "user_profiles",
          "id": "profile-uuid"
        }
      }
    }
  },
  "included": [
    {
      "type": "user_profiles",
      "id": "profile-uuid",
      "attributes": {
        "bio": "Software developer",
        "company": "Tech Company",
        "website": "https://example.com",
        "location": "San Francisco, CA",
        "timezone": "America/Los_Angeles",
        "preferences": {
          "compression_default": "medium",
          "notifications": true
        }
      }
    }
  ]
}
```

### 6. PATCH /api/v1/users/me
**Purpose**: Update user profile

**Request Body**:
```json
{
  "data": {
    "type": "users",
    "id": "user-uuid",
    "attributes": {
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "newemail@example.com"
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "type": "users",
    "id": "user-uuid",
    "attributes": {
      "email": "newemail@example.com",
      "username": "username",
      "first_name": "Jane",
      "last_name": "Smith",
      "email_verified": false,
      "is_active": true,
      "role": "user"
    }
  },
  "meta": {
    "verification_required": true
  }
}
```

### 7. GET /api/v1/users/{id}
**Purpose**: Get user by ID (admin only)

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "users",
    "id": "user-uuid",
    "attributes": {
      "email": "user@example.com",
      "username": "username",
      "first_name": "John",
      "last_name": "Doe",
      "email_verified": true,
      "is_active": true,
      "role": "user",
      "created_at": "2026-02-24T16:33:34.431Z",
      "last_login_at": "2026-02-24T16:33:34.431Z"
    }
  }
}
```

## File Management Endpoints

### 8. POST /api/v1/files
**Purpose**: Upload a file

**Request Headers**:
- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Request Body**:
```
--boundary
Content-Disposition: form-data; name="file"; filename="image.jpg"
Content-Type: image/jpeg

[binary data]
--boundary
Content-Disposition: form-data; name="compression_settings"

{"target_size_kb": 500, "quality_percentage": 80}
--boundary--
```

**Response**:
```json
{
  "data": {
    "type": "files",
    "id": "file-uuid",
    "attributes": {
      "original_filename": "image.jpg",
      "file_path": "/files/user-uuid/image-uuid.jpg",
      "file_size": 2048000,
      "file_type": "image",
      "mime_type": "image/jpeg",
      "checksum": "abc123...",
      "status": "processing",
      "created_at": "2026-02-24T16:33:34.431Z"
    }
  }
}
```

### 9. GET /api/v1/files
**Purpose**: List user files with pagination

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Query Parameters**:
- `page[size]`: Number of items per page (default: 20)
- `page[number]`: Page number (default: 1)
- `filter[type]`: File type filter (image, pdf, etc.)
- `filter[status]`: File status filter
- `sort`: Sort field (created_at, file_size, etc.)

**Response**:
```json
{
  "data": [
    {
      "type": "files",
      "id": "file-uuid-1",
      "attributes": {
        "original_filename": "image1.jpg",
        "file_path": "/files/user-uuid/image1-uuid.jpg",
        "file_size": 1024000,
        "file_type": "image",
        "mime_type": "image/jpeg",
        "status": "completed",
        "created_at": "2026-02-24T16:33:34.431Z"
      }
    }
  ],
  "meta": {
    "total": 45,
    "count": 20,
    "page": 1,
    "pages": 3
  },
  "links": {
    "first": "/api/v1/files?page[number]=1",
    "last": "/api/v1/files?page[number]=3",
    "next": "/api/v1/files?page[number]=2"
  }
}
```

### 10. GET /api/v1/files/{id}
**Purpose**: Get file details

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "files",
    "id": "file-uuid",
    "attributes": {
      "original_filename": "image.jpg",
      "file_path": "/files/user-uuid/image-uuid.jpg",
      "file_size": 1024000,
      "file_type": "image",
      "mime_type": "image/jpeg",
      "checksum": "abc123...",
      "status": "completed",
      "compression_settings": {
        "target_size_kb": 500,
        "quality_percentage": 80
      },
      "compression_ratio": 0.45,
      "created_at": "2026-02-24T16:33:34.431Z",
      "processing_started_at": "2026-02-24T16:33:35.123Z",
      "processing_completed_at": "2026-02-24T16:33:40.456Z"
    },
    "relationships": {
      "versions": {
        "data": [
          {
            "type": "file_versions",
            "id": "version-uuid-1"
          }
        ]
      },
      "metadata": {
        "data": [
          {
            "type": "file_metadata",
            "id": "metadata-uuid-1"
          }
        ]
      }
    }
  },
  "included": [
    {
      "type": "file_versions",
      "id": "version-uuid-1",
      "attributes": {
        "version_number": 1,
        "version_name": "compressed",
        "file_path": "/files/user-uuid/image-uuid-v1.jpg",
        "file_size": 512000,
        "compression_settings": {
          "target_size_kb": 500,
          "quality_percentage": 80
        },
        "created_at": "2026-02-24T16:33:40.456Z"
      }
    }
  ]
}
```

### 11. DELETE /api/v1/files/{id}
**Purpose**: Delete a file

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "files",
    "id": "file-uuid",
    "attributes": {
      "message": "File deleted successfully"
    }
  }
}
```

### 12. GET /api/v1/files/{id}/download
**Purpose**: Download a file

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**: Binary file download

## Compression Endpoints

### 13. POST /api/v1/compression/jobs
**Purpose**: Create a compression job

**Request Body**:
```json
{
  "data": {
    "type": "compression_jobs",
    "attributes": {
      "file_id": "file-uuid",
      "compression_type": "image",
      "target_size_kb": 500,
      "quality_percentage": 80,
      "priority": 1
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "type": "compression_jobs",
    "id": "job-uuid",
    "attributes": {
      "file_id": "file-uuid",
      "compression_type": "image",
      "target_size_kb": 500,
      "quality_percentage": 80,
      "status": "queued",
      "priority": 1,
      "created_at": "2026-02-24T16:33:34.431Z"
    }
  }
}
```

### 14. GET /api/v1/compression/jobs
**Purpose**: List compression jobs

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": [
    {
      "type": "compression_jobs",
      "id": "job-uuid",
      "attributes": {
        "file_id": "file-uuid",
        "compression_type": "image",
        "target_size_kb": 500,
        "quality_percentage": 80,
        "status": "completed",
        "priority": 1,
        "started_at": "2026-02-24T16:33:35.123Z",
        "completed_at": "2026-02-24T16:33:40.456Z",
        "created_at": "2026-02-24T16:33:34.431Z"
      }
    }
  ]
}
```

### 15. GET /api/v1/compression/jobs/{id}
**Purpose**: Get compression job details

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "compression_jobs",
    "id": "job-uuid",
    "attributes": {
      "file_id": "file-uuid",
      "compression_type": "image",
      "target_size_kb": 500,
      "quality_percentage": 80,
      "status": "completed",
      "priority": 1,
      "started_at": "2026-02-24T16:33:35.123Z",
      "completed_at": "2026-02-24T16:33:40.456Z",
      "error_message": null,
      "created_at": "2026-02-24T16:33:34.431Z"
    }
  }
}
```

## Conversion Endpoints

### 16. POST /api/v1/conversion/image-to-pdf
**Purpose**: Convert image to PDF

**Request Headers**:
- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Request Body**:
```
--boundary
Content-Disposition: form-data; name="image"; filename="image.jpg"
Content-Type: image/jpeg

[binary data]
--boundary
Content-Disposition: form-data; name="settings"

{"page_size": "A4", "orientation": "portrait"}
--boundary--
```

**Response**:
```json
{
  "data": {
    "type": "files",
    "id": "pdf-file-uuid",
    "attributes": {
      "original_filename": "image.pdf",
      "file_path": "/files/user-uuid/image-uuid.pdf",
      "file_size": 1024000,
      "file_type": "pdf",
      "mime_type": "application/pdf",
      "status": "completed",
      "created_at": "2026-02-24T16:33:34.431Z"
    }
  }
}
```

## API Key Management

### 17. POST /api/v1/api-keys
**Purpose**: Create API key

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Request Body**:
```json
{
  "data": {
    "type": "api_keys",
    "attributes": {
      "key_name": "My API Key",
      "permissions": {
        "read": true,
        "write": true,
        "delete": false
      },
      "rate_limit_per_minute": 100
    }
  }
}
```

**Response**:
```json
{
  "data": {
    "type": "api_keys",
    "id": "api-key-uuid",
    "attributes": {
      "key_name": "My API Key",
      "permissions": {
        "read": true,
        "write": true,
        "delete": false
      },
      "rate_limit_per_minute": 100,
      "is_active": true,
      "created_at": "2026-02-24T16:33:34.431Z",
      "api_key": "sk-abc123..."
    }
  }
}
```

### 18. GET /api/v1/api-keys
**Purpose**: List API keys

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": [
    {
      "type": "api_keys",
      "id": "api-key-uuid",
      "attributes": {
        "key_name": "My API Key",
        "permissions": {
          "read": true,
          "write": true,
          "delete": false
        },
        "rate_limit_per_minute": 100,
        "is_active": true,
        "created_at": "2026-02-24T16:33:34.431Z",
        "last_used_at": "2026-02-24T16:33:34.431Z"
      }
    }
  ]
}
```

## Rate Limiting and Usage

### 19. GET /api/v1/usage/limits
**Purpose**: Get user rate limits and usage

**Request Headers**:
- `Authorization: Bearer <access_token>`

**Response**:
```json
{
  "data": {
    "type": "usage_limits",
    "id": "user-uuid",
    "attributes": {
      "rate_limit_per_minute": 60,
      "current_usage": 15,
      "remaining": 45,
      "resets_at": "2026-02-24T16:34:00.000Z",
      "file_size_limit_mb": 1000,
      "current_usage_mb": 250,
      "remaining_mb": 750
    }
  }
}
```

## Error Handling

### Standard Error Response
```json
{
  "errors": [
    {
      "status": "400",
      "title": "Bad Request",
      "detail": "Invalid email format",
      "source": {
        "pointer": "/data/attributes/email"
      }
    }
  ]
}
```

### Common Error Codes
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Invalid or missing token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error - Server error
- `503`: Service Unavailable - Maintenance mode

## API Documentation

### OpenAPI Specification
The API includes auto-generated OpenAPI documentation at `/api/v1/docs`

### API Client Libraries
- **JavaScript**: npm package with TypeScript definitions
- **Python**: pip package with async support
- **Java**: Maven artifact with Spring support
- **Go**: Go module with context support

This API specification provides a comprehensive, secure, and scalable foundation for the To Kit platform, supporting all core features while maintaining best practices for API design and security.