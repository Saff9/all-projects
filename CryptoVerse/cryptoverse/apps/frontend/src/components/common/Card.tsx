'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export type CardVariant = 'default' | 'glass' | 'gradient' | 'outline';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  glow?: boolean;
  glowColor?: string;
  children?: React.ReactNode;
}

// ==========================================
// Styles
// ==========================================

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-slate-800/50 border border-slate-700/50',
  glass: `
    bg-gradient-to-br from-white/10 to-white/5
    backdrop-blur-xl border border-white/10
    shadow-xl shadow-black/10
  `,
  gradient: `
    bg-gradient-to-br from-purple-900/50 to-blue-900/50
    border border-purple-500/20
  `,
  outline: 'bg-transparent border border-slate-600/50',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

// ==========================================
// Component
// ==========================================

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'glass',
  padding = 'md',
  hoverable = false,
  clickable = false,
  glow = false,
  glowColor = 'purple',
  className,
  ...props
}) => {
  return (
    <motion.div
      whileHover={hoverable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.2 }}
      className={twMerge(
        clsx(
          'relative rounded-2xl overflow-hidden',
          variantStyles[variant],
          paddingStyles[padding],
          hoverable && 'cursor-pointer transition-shadow hover:shadow-lg',
          clickable && 'cursor-pointer active:shadow-inner',
          glow && `shadow-lg shadow-${glowColor}-500/20`,
          className
        )
      )}
    >
      {/* Glow effect */}
      {glow && (
        <div
          className={clsx(
            'absolute inset-0 opacity-50 blur-xl -z-10',
            `bg-gradient-to-r from-${glowColor}-500/30 to-blue-500/30`
          )}
        />
      )}

      {/* Content */}
      {children}
    </motion.div>
  );
};

// ==========================================
// Card Header
// ==========================================

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-start justify-between mb-4',
          className
        )
      )}
      {...props}
    >
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && (
          <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// ==========================================
// Card Content
// ==========================================

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={twMerge(clsx(className))} {...props}>
      {children}
    </div>
  );
};

// ==========================================
// Card Footer
// ==========================================

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'mt-4 pt-4 border-t border-slate-700/50',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;