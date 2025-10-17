'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useToast, Toast as ToastType, ToastType as ToastVariant } from '../../hooks';

// ==========================================
// Types
// ==========================================

export interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

// ==========================================
// Styles
// ==========================================

const variantStyles: Record<ToastVariant, { bg: string; icon: string }> = {
  success: {
    bg: 'bg-green-500/20 border-green-500/50',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-500/20 border-red-500/50',
    icon: '✕',
  },
  warning: {
    bg: 'bg-yellow-500/20 border-yellow-500/50',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-500/20 border-blue-500/50',
    icon: 'ℹ',
  },
};

// ==========================================
// Single Toast Component
// ==========================================

const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const style = variantStyles[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={twMerge(
        clsx(
          'flex items-center gap-3 p-4 rounded-xl border backdrop-blur-sm',
          'bg-slate-800/90 shadow-lg',
          style.bg
        )
      )}
    >
      {/* Icon */}
      <div
        className={clsx(
          'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold',
          toast.type === 'success' && 'bg-green-500 text-white',
          toast.type === 'error' && 'bg-red-500 text-white',
          toast.type === 'warning' && 'bg-yellow-500 text-black',
          toast.type === 'info' && 'bg-blue-500 text-white'
        )}
      >
        {style.icon}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-white">{toast.message}</p>

      {/* Action */}
      {toast.action && (
        <button
          onClick={toast.action.onClick}
          className="text-sm font-medium text-purple-400 hover:text-purple-300"
        >
          {toast.action.label}
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors"
      >
        <svg
          className="w-4 h-4 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
};

// ==========================================
// Toast Container
// ==========================================

export const ToastContainer: React.FC = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;