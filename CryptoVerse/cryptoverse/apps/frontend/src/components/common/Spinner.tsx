'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}

// ==========================================
// Styles
// ==========================================

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4',
};

// ==========================================
// Component
// ==========================================

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'border-white',
  className,
}) => {
  return (
    <motion.div
      className={twMerge(
        clsx(
          'rounded-full border-transparent',
          'border-t-current',
          sizeStyles[size],
          color
        )
      )}
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
};

// ==========================================
// Loading Overlay
// ==========================================

export interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  spinnerSize?: SpinnerSize;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  children,
  spinnerSize = 'md',
  className,
}) => {
  return (
    <div className={twMerge('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-inherit">
          <Spinner size={spinnerSize} />
        </div>
      )}
    </div>
  );
};

export default Spinner;