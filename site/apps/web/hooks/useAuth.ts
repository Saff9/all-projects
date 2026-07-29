'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, User, selectUser, selectIsAuthenticated, selectIsLoading, selectError } from '@/stores/auth.store';

/**
 * Main authentication hook
 * Provides all auth state and actions
 */
export function useAuth() {
  const router = useRouter();
  const user = useAuthStore(selectUser);
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const error = useAuthStore(selectError);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const refreshTokens = useAuthStore((state) => state.refreshTokens);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const clearError = useAuthStore((state) => state.clearError);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  // Login with redirect
  const loginWithRedirect = useCallback(async (email: string, password: string, redirectTo?: string) => {
    try {
      await login(email, password);
      router.push(redirectTo || '/dashboard');
    } catch (error) {
      // Error is already set in the store
    }
  }, [login, router]);

  // Register with redirect
  const registerWithRedirect = useCallback(async (data: {
    email: string;
    password: string;
    fullName: string;
    phone?: string;
    targetExam?: string;
    targetYear?: number;
  }, redirectTo?: string) => {
    try {
      await register(data);
      router.push(redirectTo || '/dashboard');
    } catch (error) {
      // Error is already set in the store
    }
  }, [register, router]);

  // Logout with redirect
  const logoutWithRedirect = useCallback(async (redirectTo?: string) => {
    await logout();
    router.push(redirectTo || '/login');
  }, [logout, router]);

  // Check if user has specific role
  const hasRole = useCallback((role: string) => {
    return user?.role === role;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((roles: string[]) => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin';
  }, [user]);

  // Check if user is premium
  const isPremium = useCallback(() => {
    return user?.subscriptionStatus === 'premium';
  }, [user]);

  // Check if email is verified
  const isEmailVerified = useCallback(() => {
    return !!user?.emailVerifiedAt;
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    loginWithRedirect,
    register,
    registerWithRedirect,
    logout,
    logoutWithRedirect,
    refreshTokens,
    fetchUser,
    clearError,
    updateProfile,
    
    // Helpers
    hasRole,
    hasAnyRole,
    isAdmin,
    isPremium,
    isEmailVerified,
  };
}

/**
 * Hook to get current user
 * Returns the user object or null
 */
export function useUser(): User | null {
  return useAuthStore(selectUser);
}

/**
 * Hook to check if user is authenticated
 * Returns boolean
 */
export function useIsAuthenticated(): boolean {
  return useAuthStore(selectIsAuthenticated);
}

/**
 * Hook to check auth loading state
 * Returns boolean
 */
export function useAuthLoading(): boolean {
  return useAuthStore(selectIsLoading);
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = '/login') {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Try to fetch user if we have a token
      const accessToken = useAuthStore.getState().accessToken;
      if (accessToken) {
        fetchUser();
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isLoading, router, redirectTo, fetchUser]);

  return { isAuthenticated, isLoading };
}

/**
 * Hook to redirect authenticated users away from auth pages
 * (e.g., redirect from login to dashboard if already logged in)
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/dashboard') {
  const router = useRouter();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const isLoading = useAuthStore(selectIsLoading);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

export default useAuth;
