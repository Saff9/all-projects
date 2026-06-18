import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Conversation,
  ConversationDetail,
  Message,
  Provider,
  Settings,
  Toast,
} from '../types';

interface UIState {
  sidebarOpen: boolean;
  settingsOpen: boolean;
  toasts: Toast[];
  isMobile: boolean;
}

interface ChatState {
  conversations: Conversation[];
  currentConversation: ConversationDetail | null;
  messages: Message[];
  isLoading: boolean;
  streamingMessage: string;
  streamingMessageId: string | null;
}

interface ProviderState {
  providers: Provider[];
  selectedProvider: string | null;
  selectedModel: string | null;
}

interface SettingsState {
  settings: Settings | null;
  theme: 'dark' | 'light' | 'system';
}

interface StoreState extends UIState, ChatState, ProviderState, SettingsState {
  // UI Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openSettings: () => void;
  closeSettings: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setIsMobile: (isMobile: boolean) => void;

  // Chat Actions
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  setCurrentConversation: (conversation: ConversationDetail | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  setIsLoading: (loading: boolean) => void;
  setStreamingMessage: (message: string) => void;
  appendStreamingToken: (token: string) => void;
  setStreamingMessageId: (id: string | null) => void;
  clearStreaming: () => void;

  // Provider Actions
  setProviders: (providers: Provider[]) => void;
  setSelectedProvider: (providerId: string | null) => void;
  setSelectedModel: (modelId: string | null) => void;

  // Settings Actions
  setSettings: (settings: Settings) => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // UI State
      sidebarOpen: true,
      settingsOpen: false,
      toasts: [],
      isMobile: false,

      // Chat State
      conversations: [],
      currentConversation: null,
      messages: [],
      isLoading: false,
      streamingMessage: '',
      streamingMessageId: null,

      // Provider State
      providers: [],
      selectedProvider: null,
      selectedModel: null,

      // Settings State
      settings: null,
      theme: 'dark',

      // UI Actions
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      openSettings: () => set({ settingsOpen: true }),
      closeSettings: () => set({ settingsOpen: false }),
      addToast: (toast) => {
        const id = generateId();
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 5000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      setIsMobile: (isMobile) => set({ isMobile }),

      // Chat Actions
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        })),
      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
          currentConversation:
            state.currentConversation?.id === id
              ? { ...state.currentConversation, ...updates }
              : state.currentConversation,
        })),
      removeConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversation:
            state.currentConversation?.id === id
              ? null
              : state.currentConversation,
        })),
      setCurrentConversation: (conversation) =>
        set({
          currentConversation: conversation,
          messages: conversation?.messages || [],
        }),
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      removeMessage: (id) =>
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== id),
        })),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setStreamingMessage: (message) => set({ streamingMessage: message }),
      appendStreamingToken: (token) =>
        set((state) => ({
          streamingMessage: state.streamingMessage + token,
        })),
      setStreamingMessageId: (id) => set({ streamingMessageId: id }),
      clearStreaming: () =>
        set({ streamingMessage: '', streamingMessageId: null }),

      // Provider Actions
      setProviders: (providers) => set({ providers }),
      setSelectedProvider: (providerId) => set({ selectedProvider: providerId }),
      setSelectedModel: (modelId) => set({ selectedModel: modelId }),

      // Settings Actions
      setSettings: (settings) => set({ settings }),
      setTheme: (theme) => {
        set({ theme });
        // Apply theme to document
        const root = document.documentElement;
        if (theme === 'system') {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
          root.setAttribute('data-theme', theme);
        }
      },
    }),
    {
      name: 'genzsmart-storage',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        selectedProvider: state.selectedProvider,
        selectedModel: state.selectedModel,
      }),
    }
  )
);

// Theme initialization
export const initializeTheme = () => {
  const theme = useStore.getState().theme;
  useStore.getState().setTheme(theme);

  // Listen for system theme changes
  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (e) => {
      if (useStore.getState().theme === 'system') {
        document.documentElement.setAttribute(
          'data-theme',
          e.matches ? 'dark' : 'light'
        );
      }
    });
};

// Mobile detection
export const initializeMobileDetection = () => {
  const checkMobile = () => {
    useStore.getState().setIsMobile(window.innerWidth < 768);
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);

  return () => window.removeEventListener('resize', checkMobile);
};