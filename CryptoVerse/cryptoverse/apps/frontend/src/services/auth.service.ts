import { api, tokenManager } from './api';
import { User } from '@cryptoverse/shared';

// ==========================================
// Types
// ==========================================

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user_id: string;
  is_new_user: boolean;
}

export interface TelegramAuthData {
  user: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
  };
  auth_date: number;
  query_id?: string;
  hash: string;
}

// ==========================================
// Auth Service
// ==========================================

export const authService = {
  /**
   * Login with Telegram WebApp init data
   */
  loginWithTelegram: async (initData: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/telegram', {
      init_data: initData,
    });
    
    // Store tokens
    if (response.access_token && response.refresh_token) {
      tokenManager.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    // Store new tokens
    if (response.access_token && response.refresh_token) {
      tokenManager.setTokens(response.access_token, response.refresh_token);
    }
    
    return response;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    return api.get<User>('/auth/me');
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      // Always clear tokens on logout
      tokenManager.clearTokens();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!tokenManager.getAccessToken();
  },

  /**
   * Get stored access token
   */
  getAccessToken: (): string | null => {
    return tokenManager.getAccessToken();
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken: (): string | null => {
    return tokenManager.getRefreshToken();
  },
};

export default authService;