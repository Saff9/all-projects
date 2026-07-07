# SecureVibe Developer Integration Guide

## Overview
SecureVibe provides a complete authentication solution that can be integrated into any application. This guide covers implementation details, API usage, and best practices for developers.

## Quick Start

### 1. Sign Up for SecureVibe
1. Visit securevibe.com
2. Create account (first 3 users free)
3. Get API keys from dashboard
4. Start integrating

### 2. Basic Integration
```javascript
// Frontend Integration Example
const SECUREVIBE_API = 'https://your-securevibe-instance.com/api';

// Register User
async function registerUser(userData) {
  const response = await fetch(`${SECUREVIBE_API}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your_api_key'
    },
    body: JSON.stringify({
      ...userData,
      captchaId: captchaId,
      captcha: captchaInput
    })
  });
  return response.json();
}

// Login User
async function loginUser(credentials) {
  const response = await fetch(`${SECUREVIBE_API}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your_api_key'
    },
    body: JSON.stringify(credentials)
  });
  return response.json();
}
```

## API Reference

### Authentication Endpoints

#### Generate Captcha
```http
GET /api/captcha
```
**Response:**
```json
{
  "success": true,
  "captchaId": "unique_id",
  "captcha": "<svg>...</svg>",
  "poweredBy": "SecureVibe"
}
```

#### Register User
```http
POST /api/auth/register
Content-Type: application/json
X-API-Key: your_api_key

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "captchaId": "captcha_id",
  "captcha": "user_input"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json
X-API-Key: your_api_key

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "email_verification_token"
}
```

#### Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer access_token
```

### Protected Routes

#### Using JWT Tokens
```javascript
// Include token in requests
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'X-API-Key': 'your_api_key'
};
```

#### Token Refresh Logic
```javascript
async function refreshAccessToken() {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
    }
  } catch (error) {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

## Frontend Integration Examples

### React Integration
```jsx
import React, { useState, useEffect } from 'react';

function AuthComponent() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile');
    }
  };

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}!</h2>
          <p>Protected by SecureVibe</p>
        </div>
      ) : (
        <LoginForm onLogin={setToken} />
      )}
    </div>
  );
}
```

### Vue.js Integration
```javascript
// Auth Store (Pinia/Vuex)
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    refreshToken: localStorage.getItem('refreshToken')
  }),

  actions: {
    async login(credentials) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.refreshToken = data.data.refreshToken;
        this.user = data.data.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('refreshToken', this.refreshToken);
      }

      return data;
    },

    async refreshToken() {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      const data = await response.json();

      if (data.success) {
        this.token = data.data.token;
        this.refreshToken = data.data.refreshToken;
      }

      return data;
    }
  }
});
```

### Angular Integration
```typescript
// Auth Service
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://your-securevibe-instance.com/api';
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          this.tokenSubject.next(response.data.token);
        }
      })
    );
  }

  refreshToken(): Observable<any> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http.post(`${this.apiUrl}/auth/refresh`, { refreshToken }).pipe(
      tap((response: any) => {
        if (response.success) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          this.tokenSubject.next(response.data.token);
        }
      })
    );
  }

  getToken(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }
}
```

## Security Best Practices

### Token Management
- Store tokens securely (httpOnly cookies in production)
- Implement automatic token refresh
- Clear tokens on logout
- Handle token expiration gracefully

### Error Handling
```javascript
try {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (!data.success) {
    // Handle different error types
    switch (data.message) {
      case 'Invalid credentials':
        showError('Wrong email or password');
        break;
      case 'Please verify your email first':
        showError('Check your email for verification link');
        break;
      default:
        showError(data.message);
    }
  } else {
    // Success handling
    handleLoginSuccess(data.data);
  }
} catch (error) {
  console.error('Network error:', error);
  showError('Connection failed. Please try again.');
}
```

### Rate Limiting
- Respect API rate limits (100 requests/15min)
- Implement client-side caching
- Use exponential backoff for retries

## Advanced Features

### Device Tracking
SecureVibe tracks user login devices for security monitoring.

### Multi-Factor Authentication
Future feature for enhanced security.

### Social Login
Google OAuth integration available.

### API Key Management
Generate and manage API keys through admin dashboard.

## Testing

### Unit Tests
```javascript
// Example test for auth service
describe('AuthService', () => {
  it('should login user successfully', async () => {
    const mockResponse = {
      success: true,
      data: {
        user: { id: '1', name: 'Test User' },
        token: 'jwt_token',
        refreshToken: 'refresh_token'
      }
    };

    // Mock fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockResponse)
      })
    );

    const result = await authService.login({
      email: 'test@example.com',
      password: 'password'
    });

    expect(result.success).toBe(true);
    expect(result.data.user.name).toBe('Test User');
  });
});
```

### Integration Tests
```javascript
// End-to-end test example
describe('Authentication Flow', () => {
  it('should complete full auth flow', async () => {
    // 1. Generate captcha
    const captchaResponse = await request(app).get('/api/captcha');
    expect(captchaResponse.status).toBe(200);

    // 2. Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        captchaId: captchaResponse.body.captchaId,
        captcha: 'test' // Mock captcha
      });
    expect(registerResponse.status).toBe(201);

    // 3. Verify email (mock)
    // 4. Login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your domain is in the CORS whitelist
   - Check API_BASE_URL configuration

2. **Token Expiration**
   - Implement automatic refresh logic
   - Handle 401 responses by refreshing tokens

3. **Captcha Issues**
   - Always fetch fresh captcha before registration
   - Verify captcha input matches generated text

4. **Rate Limiting**
   - Monitor your request frequency
   - Implement request queuing for high-traffic apps

### Debug Mode
Enable debug logging in development:
```javascript
localStorage.setItem('debug', 'securevibe:*');
```

## Support

### Documentation
- API Reference: https://docs.securevibe.com/api
- SDKs: https://docs.securevibe.com/sdks
- Examples: https://github.com/securevibe/examples

### Community
- GitHub Issues: Report bugs and request features
- Discord: Real-time support and discussions
- Stack Overflow: Tag questions with `securevibe`

### Enterprise Support
- Priority support for paid plans
- Dedicated account manager
- Custom integrations
- SLA guarantees

## Changelog

### v1.0.0
- Initial release
- Basic authentication features
- Google OAuth integration
- Admin dashboard
- API key management

---

**Protected by SecureVibe** 🛡️
