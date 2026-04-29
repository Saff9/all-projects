'use client';

import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: (event?: KeyboardEvent) => void;
  description?: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in input fields (except for CMD/CTRL combinations)
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      // Allow shortcuts in input fields for CMD/CTRL combinations
      const isAllowedInInput =
        isInputField && (event.ctrlKey || event.metaKey);

      if (isInputField && !isAllowedInInput) return;

      for (const shortcut of shortcutsRef.current) {
        const { key, modifiers, action } = shortcut;

        // Check if the key matches
        if (event.key.toLowerCase() !== key.toLowerCase()) continue;

        // Check modifiers
        const ctrlMatch = modifiers.includes('ctrl') === (event.ctrlKey || event.metaKey);
        const altMatch = modifiers.includes('alt') === event.altKey;
        const shiftMatch = modifiers.includes('shift') === event.shiftKey;
        const metaMatch = modifiers.includes('meta') === event.metaKey;

        // For simple keys without modifiers
        if (modifiers.length === 0 && !ctrlMatch && !altMatch && !shiftMatch && !metaMatch) {
          // Allow in input fields for simple keys
          if (!isInputField) {
            if (preventDefault) event.preventDefault();
            action();
            return;
          }
        }

        // For modifier combinations
        if (modifiers.length > 0 && ctrlMatch && altMatch && shiftMatch && metaMatch) {
          if (preventDefault) event.preventDefault();
          action();
          return;
        }
      }
    },
    [enabled, preventDefault]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Preset shortcuts for common actions
export const commonShortcuts: KeyboardShortcut[] = [
  {
    key: 'c',
    modifiers: ['ctrl', 'meta'],
    action: () => {
      // Copy to clipboard - will be handled by the component
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement?.tagName === 'TEXTAREA' || activeElement?.tagName === 'INPUT') {
        (activeElement as HTMLInputElement | HTMLTextAreaElement).select();
        document.execCommand('copy');
      }
    },
    description: 'Copy selected content',
  },
  {
    key: 'v',
    modifiers: ['ctrl', 'meta'],
    action: () => {
      // Paste - will be handled by the browser
    },
    description: 'Paste from clipboard',
  },
  {
    key: '/',
    modifiers: ['ctrl', 'meta'],
    action: () => {
      // Clear content - will be handled by the component
    },
    description: 'Clear content',
  },
  {
    key: 's',
    modifiers: ['ctrl', 'meta'],
    action: () => {
      // Swap panels - will be handled by the component
    },
    description: 'Swap panels',
  },
  {
    key: 'k',
    modifiers: ['ctrl', 'meta'],
    action: () => {
      // Open search - will be handled by Header component
      const searchButton = document.querySelector('[data-search-button]') as HTMLElement;
      searchButton?.click();
    },
    description: 'Open search',
  },
  {
    key: 'Escape',
    modifiers: [],
    action: () => {
      // Close modals, etc.
      const closeButtons = document.querySelectorAll('[data-close-modal]');
      closeButtons.forEach((btn) => (btn as HTMLElement).click());
    },
    description: 'Close modal',
  },
];

// Hook for copy functionality
export function useCopyToClipboard() {
  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }, []);

  return copy;
}

// Hook for keyboard shortcut display
export interface ShortcutDisplay {
  key: string;
  modifiers: string[];
  description: string;
}

export function formatShortcut(shortcut: KeyboardShortcut): ShortcutDisplay {
  const modifierLabels: Record<string, string> = {
    ctrl: '⌘',
    meta: '⌘',
    alt: '⌥',
    shift: '⇧',
  };

  return {
    key: shortcut.key.toUpperCase(),
    modifiers: shortcut.modifiers.map((m) => modifierLabels[m] || m),
    description: shortcut.description || '',
  };
}
