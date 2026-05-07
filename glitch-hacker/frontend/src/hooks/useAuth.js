/**
 * useAuth Hook
 * Handles Telegram WebApp authentication and auto-login
 */

import { useEffect, useCallback, useState } from 'react';
import useAuthStore from '../stores/authStore';
import useUserStore from '../stores/userStore';

// Check if running inside Telegram WebApp
const isTelegramWebApp = () => {
  return window.Telegram?.WebApp !== undefined;
};

// Get initData from Telegram WebApp
const getTelegramInitData = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initData;
  }
  return null;
};

// Get user from Telegram WebApp
const getTelegramUser = () => {
  if (isTelegramWebApp()) {
    return window.Telegram.WebApp.initDataUnsafe?.user;
  }
  return null;
};

export const useAuth = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
    clearError,
  } = useAuthStore();

  const { fetchUser, reset: resetUser } = useUserStore();

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // First check if we have a stored token
      const hasToken = checkAuth();
      
      if (hasToken) {
        // Try to fetch user data with existing token
        const result = await fetchUser();
        if (!result.success) {
          // Token might be expired, try to re-authenticate
          console.log('Token expired or invalid, attempting re-authentication...');
        }
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, [checkAuth, fetchUser]);

  // Auto-login with Telegram initData
  const autoLogin = useCallback(async () => {
    const initData = getTelegramInitData();
    
    if (!initData) {
      console.log('Not running in Telegram WebApp or no initData available');
      return { success: false, error: 'No Telegram initData available' };
    }

    const result = await login(initData);
    
    if (result.success) {
      // Fetch user data after successful login
      await fetchUser();
    }
    
    return result;
  }, [login, fetchUser]);

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    resetUser();
  }, [logout, resetUser]);

  // Get Telegram user info (for display purposes)
  const telegramUser = getTelegramUser();

  // Development mode: provide mock login function
  const devAutoLogin = useCallback(async () => {
    if (import.meta.env.DEV) {
      // Create mock initData for development
      const mockInitData = `user=${encodeURIComponent(JSON.stringify({
        id: '123456789',
        username: 'dev_hacker',
        first_name: 'Dev',
        last_name: 'Hacker',
        photo_url: ''
      }))}&auth_date=${Math.floor(Date.now() / 1000)}&hash=dev_hash`;
      
      return await login(mockInitData);
    }
    return { success: false, error: 'Not in development mode' };
  }, [login]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    telegramUser,
    isTelegram: isTelegramWebApp(),
    
    // Actions
    login,
    logout: handleLogout,
    autoLogin,
    devAutoLogin,
    clearError,
    refreshUser: fetchUser,
  };
};

export default useAuth;
