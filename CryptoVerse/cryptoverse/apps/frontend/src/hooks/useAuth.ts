import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores';
import { authService, telegramService } from '../services';

// ==========================================
// Hook
// ==========================================

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    isNewUser,
    error,
    login,
    logout,
    refreshUser,
    setUser,
    setLoading,
    setError,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Check if we have a stored token
      if (authService.isAuthenticated()) {
        try {
          await refreshUser();
        } catch {
          // Token might be expired, try to refresh
          const refreshToken = authService.getRefreshToken();
          if (refreshToken) {
            try {
              await authService.refreshToken(refreshToken);
              await refreshUser();
            } catch {
              // Refresh failed, need to re-login
              setLoading(false);
            }
          } else {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, [refreshUser, setLoading]);

  // Login with Telegram
  const loginWithTelegram = useCallback(async () => {
    try {
      const initData = telegramService.getInitData();
      if (!initData) {
        throw new Error('Telegram init data not available');
      }
      await login(initData);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    }
  }, [login, setError]);

  // Logout
  const handleLogout = useCallback(async () => {
    await logout();
    router.push('/login');
  }, [logout, router]);

  // Check if user needs onboarding
  const needsOnboarding = isNewUser && !user?.username;

  return {
    user,
    isAuthenticated,
    isLoading,
    isNewUser,
    needsOnboarding,
    error,
    login: loginWithTelegram,
    logout: handleLogout,
    refreshUser,
    setUser,
    setError,
  };
}

export default useAuth;