'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHaptics } from '../../hooks';

// ==========================================
// Types
// ==========================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// ==========================================
// Styles
// ==========================================

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4',
};

// ==========================================
// Animation Variants
// ==========================================

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

// ==========================================
// Component
// ==========================================

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  footer,
  className,
}) => {
  const haptics = useHaptics();

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        haptics.selection();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape, haptics]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlayClick) {
      haptics.selection();
      onClose();
    }
  }, [closeOnOverlayClick, onClose, haptics]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleOverlayClick}
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={twMerge(
              clsx(
                'relative w-full bg-slate-900 border border-slate-700/50',
                'rounded-t-3xl sm:rounded-2xl shadow-xl',
                'max-h-[90vh] overflow-hidden flex flex-col',
                sizeStyles[size],
                className
              )
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-4 border-b border-slate-700/50">
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-slate-400 mt-1">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={() => {
                      haptics.selection();
                      onClose();
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-slate-400"
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
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-4 border-t border-slate-700/50">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ==========================================
// Bottom Sheet Variant
// ==========================================

export interface BottomSheetProps extends Omit<ModalProps, 'size'> {
  snapPoints?: string[];
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  showCloseButton = false,
  closeOnOverlayClick = true,
  children,
  className,
}) => {
  const haptics = useHaptics();

  const sheetVariants = {
    hidden: { y: '100%' },
    visible: { y: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (closeOnOverlayClick) {
                haptics.selection();
                onClose();
              }
            }}
          />

          {/* Sheet */}
          <motion.div
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={twMerge(
              clsx(
                'relative w-full bg-slate-900 border border-slate-700/50',
                'rounded-t-3xl shadow-xl',
                'max-h-[85vh] overflow-hidden flex flex-col',
                className
              )
            )}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-600 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 pb-2">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;