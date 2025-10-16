'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  size?: InputSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ==========================================
// Styles
// ==========================================

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-5 py-3 text-lg',
};

// ==========================================
// Component
// ==========================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            className={twMerge(
              clsx(
                'w-full rounded-xl border bg-slate-800/50 text-white',
                'placeholder:text-slate-500',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-all duration-200',
                sizeStyles[size],
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error
                  ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                  : 'border-slate-600/50',
                className
              )
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ==========================================
// Textarea
// ==========================================

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className={clsx(fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          disabled={disabled}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-xl border bg-slate-800/50 text-white',
              'placeholder:text-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-all duration-200 resize-none',
              error
                ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                : 'border-slate-600/50',
              className
            )
          )}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}

        {/* Hint */}
        {hint && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

// ==========================================
// Search Input
// ==========================================

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onSearch?: (value: string) => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        leftIcon={
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        }
        placeholder="Search..."
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default Input;