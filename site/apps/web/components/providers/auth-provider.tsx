'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, User } from '@/stores/auth.store';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  // Check auth status on mount
  useEffect(() => {
    const initAuth = async () => {
      // If we have an access token but no user, fetch the user
      if (accessToken && !user) {
        setLoading(true);
        await fetchUser();
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Only run on mount

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth context
 * Use this for simple auth state access
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider;
