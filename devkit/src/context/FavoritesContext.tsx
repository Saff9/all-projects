'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface RecentlyUsed {
  toolId: string;
  timestamp: number;
}

interface FavoritesContextType {
  favorites: string[];
  recentlyUsed: RecentlyUsed[];
  toggleFavorite: (toolId: string) => void;
  isFavorite: (toolId: string) => boolean;
  addToRecentlyUsed: (toolId: string) => void;
  getRecentlyUsedTools: () => RecentlyUsed[];
  clearRecentlyUsed: () => void;
  maxRecentItems: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_KEY = 'devkit-favorites';
const RECENTLY_USED_KEY = 'devkit-recently-used';
const MAX_RECENT_ITEMS = 10;

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<RecentlyUsed[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_KEY);
      const storedRecent = localStorage.getItem(RECENTLY_USED_KEY);

      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedRecent) {
        setRecentlyUsed(JSON.parse(storedRecent));
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  // Save recently used to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(recentlyUsed));
    }
  }, [recentlyUsed, isLoaded]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(toolId);
      if (isFav) {
        return prev.filter((id) => id !== toolId);
      } else {
        return [...prev, toolId];
      }
    });
  }, []);

  const isFavorite = useCallback(
    (toolId: string) => favorites.includes(toolId),
    [favorites]
  );

  const addToRecentlyUsed = useCallback((toolId: string) => {
    setRecentlyUsed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.toolId !== toolId);
      // Add to front
      const updated = [{ toolId, timestamp: Date.now() }, ...filtered];
      // Keep only max items
      return updated.slice(0, MAX_RECENT_ITEMS);
    });
  }, []);

  const getRecentlyUsedTools = useCallback(() => {
    return recentlyUsed.sort((a, b) => b.timestamp - a.timestamp);
  }, [recentlyUsed]);

  const clearRecentlyUsed = useCallback(() => {
    setRecentlyUsed([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        recentlyUsed,
        toggleFavorite,
        isFavorite,
        addToRecentlyUsed,
        getRecentlyUsedTools,
        clearRecentlyUsed,
        maxRecentItems: MAX_RECENT_ITEMS,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}

// Hook for managing theme (light/dark mode)
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'devkit-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = stored || (prefersDark ? 'dark' : 'dark');
    setThemeState(initialTheme);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme, isLoaded]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
