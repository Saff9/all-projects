'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useHaptics } from '../../hooks';
import { Spinner } from './Spinner';

// ==========================================
// Types
// ==========================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  haptic?: boolean;
}

// ==========================================
// Styles
// ==========================================

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-purple-600 to-blue-600
    hover:from-purple-500 hover:to-blue-500
    text-white shadow-lg shadow-purple-500/25
    active:shadow-purple-500/40
  `,
  secondary: `
    bg-slate-800/80 backdrop-blur-sm
    hover:bg-slate-700/80
    text-white border border-slate-600/50
    active:border-slate-500
  `,
  outline: `
    bg-transparent
    hover:bg-white/5
    text-white border-2 border-purple-500/50
    hover:border-purple-400
    active:border-purple-300
  `,
  ghost: `
    bg-transparent
    hover:bg-white/10
    text-white
    active:bg-white/20
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-pink-600
    hover:from-red-500 hover:to-pink-500
    text-white shadow-lg shadow-red-500/25
    active:shadow-red-500/40
  `,
  success: `
    bg-gradient-to-r from-green-600 to-emerald-600
    hover:from-green-500 hover:to-emerald-500
    text-white shadow-lg shadow-green-500/25
    active:shadow-green-500/40
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-4 py-2 text-base rounded-xl gap-2',
  lg: 'px-6 py-3 text-lg rounded-xl gap-2',
  xl: 'px-8 py-4 text-xl rounded-2xl gap-3',
};

// ==========================================
// Component
// ==========================================

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  className,
  onClick,
  disabled,
  ...props
}) => {
  const haptics = useHaptics();
  const isButtonDisabled = isDisabled || isLoading || disabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (haptic && !isButtonDisabled) {
      haptics.buttonPress();
    }
    onClick?.(e);
  };

  return (
    <motion.button
      whileHover={!isButtonDisabled ? { scale: 1.02 } : undefined}
      whileTap={!isButtonDisabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
      className={twMerge(
        clsx(
          'relative inline-flex items-center justify-center font-semibold',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-2 focus:ring-offset-slate-900',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )
      )}
      onClick={handleClick}
      disabled={isButtonDisabled}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={size === 'sm' ? 'sm' : 'md'} />
        </span>
      )}

      <span
        className={clsx(
          'inline-flex items-center gap-inherit',
          isLoading && 'invisible'
        )}
      >
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children && <span>{children}</span>}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </motion.button>
  );
};

export default Button;