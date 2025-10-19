import { create } from 'zustand';

// ==========================================
// Types
// ==========================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  toasts: Toast[];
}

interface ToastActions {
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

type ToastStore = ToastState & ToastActions;

// ==========================================
// Toast Store
// ==========================================

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 3000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },
}));

// ==========================================
// Hook
// ==========================================

export function useToast() {
  const { toasts, addToast, removeToast, clearToasts } = useToastStore();

  // Success toast
  const success = (message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', message, ...options });
  };

  // Error toast
  const error = (message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', message, duration: 5000, ...options });
  };

  // Warning toast
  const warning = (message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', message, ...options });
  };

  // Info toast
  const info = (message: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', message, ...options });
  };

  // Generic showToast method
  const showToast = (message: string, type: ToastType = 'info', options?: Partial<Toast>) => {
    return addToast({ type, message, ...options });
  };

  // Custom toast
  const custom = (toast: Omit<Toast, 'id'>) => {
    return addToast(toast);
  };

  // Dismiss toast
  const dismiss = (id: string) => {
    removeToast(id);
  };

  // Dismiss all toasts
  const dismissAll = () => {
    clearToasts();
  };

  return {
    toasts,
    success,
    error,
    warning,
    info,
    showToast,
    custom,
    dismiss,
    dismissAll,
  };
}

export default useToast;