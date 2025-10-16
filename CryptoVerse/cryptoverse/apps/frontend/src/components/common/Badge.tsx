'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export type BadgeVariant = 'default' | 'outline' | 'solid' | 'gradient' | 'success' | 'warning' | 'rarity' | 'premium';
export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeColor = 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gold' | 'slate';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
  animated?: boolean;
  className?: string;
  style?: React.CSSProperties;
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

// ==========================================
// Styles
// ==========================================

const variantStyles: Record<BadgeVariant, Record<BadgeColor, string>> = {
  default: {
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    gold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  outline: {
    purple: 'bg-transparent text-purple-400 border-purple-500',
    blue: 'bg-transparent text-blue-400 border-blue-500',
    green: 'bg-transparent text-green-400 border-green-500',
    yellow: 'bg-transparent text-yellow-400 border-yellow-500',
    red: 'bg-transparent text-red-400 border-red-500',
    gold: 'bg-transparent text-amber-400 border-amber-500',
    slate: 'bg-transparent text-slate-400 border-slate-500',
  },
  solid: {
    purple: 'bg-purple-500 text-white border-purple-500',
    blue: 'bg-blue-500 text-white border-blue-500',
    green: 'bg-green-500 text-white border-green-500',
    yellow: 'bg-yellow-500 text-black border-yellow-500',
    red: 'bg-red-500 text-white border-red-500',
    gold: 'bg-amber-500 text-black border-amber-500',
    slate: 'bg-slate-500 text-white border-slate-500',
  },
  gradient: {
    purple: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-transparent',
    green: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-transparent',
    yellow: 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-transparent',
    red: 'bg-gradient-to-r from-red-600 to-pink-600 text-white border-transparent',
    gold: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    slate: 'bg-gradient-to-r from-slate-600 to-slate-500 text-white border-transparent',
  },
  success: {
    purple: 'bg-green-500/20 text-green-300 border-green-500/30',
    blue: 'bg-green-500/20 text-green-300 border-green-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    yellow: 'bg-green-500/20 text-green-300 border-green-500/30',
    red: 'bg-green-500/20 text-green-300 border-green-500/30',
    gold: 'bg-green-500/20 text-green-300 border-green-500/30',
    slate: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
  warning: {
    purple: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    blue: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    green: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    red: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    gold: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    slate: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  },
  rarity: {
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    green: 'bg-green-500/20 text-green-300 border-green-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    gold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    slate: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  },
  premium: {
    purple: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    blue: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    green: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    yellow: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    red: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    gold: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
    slate: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-black border-transparent',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

// ==========================================
// Component
// ==========================================

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  color = 'purple',
  icon,
  removable = false,
  onRemove,
  animated = false,
  className,
  style,
  rarity,
}) => {
  const Component = animated ? motion.span : 'span';
  
  // Map rarity to color
  const rarityColorMap: Record<string, BadgeColor> = {
    common: 'slate',
    uncommon: 'green',
    rare: 'blue',
    epic: 'purple',
    legendary: 'gold',
  };
  
  const effectiveColor = rarity ? rarityColorMap[rarity] : color;
  
  const animationProps = animated
    ? {
        initial: { scale: 0 },
        animate: { scale: 1 },
        exit: { scale: 0 },
        transition: { type: 'spring', stiffness: 500, damping: 30 },
      }
    : {};

  return (
    <Component
      {...animationProps}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border',
          variantStyles[variant][effectiveColor],
          sizeStyles[size],
          className
        )
      )}
      style={style}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children || (rarity && rarity.charAt(0).toUpperCase() + rarity.slice(1))}</span>
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="flex-shrink-0 ml-1 hover:opacity-70 transition-opacity"
        >
          <svg
            className="w-3 h-3"
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
    </Component>
  );
};

// ==========================================
// Rarity Badge (Specialized for Characters)
// ==========================================

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface RarityBadgeProps {
  rarity: Rarity;
  size?: BadgeSize;
  className?: string;
}

const rarityStyles: Record<Rarity, { bg: string; text: string; border: string }> = {
  common: {
    bg: 'bg-slate-500/20',
    text: 'text-slate-300',
    border: 'border-slate-500/30',
  },
  uncommon: {
    bg: 'bg-green-500/20',
    text: 'text-green-300',
    border: 'border-green-500/30',
  },
  rare: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
  },
  epic: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-300',
    border: 'border-purple-500/30',
  },
  legendary: {
    bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
  },
};

export const RarityBadge: React.FC<RarityBadgeProps> = ({
  rarity,
  size = 'md',
  className,
}) => {
  const style = rarityStyles[rarity];

  return (
    <Badge
      variant="default"
      size={size}
      className={twMerge(clsx(style.bg, style.text, style.border, className))}
    >
      {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
    </Badge>
  );
};

// ==========================================
// Level Badge
// ==========================================

export interface LevelBadgeProps {
  level: number;
  size?: BadgeSize;
  className?: string;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  className,
}) => {
  return (
    <Badge
      variant="gradient"
      color="purple"
      size={size}
      className={className}
    >
      Lv. {level}
    </Badge>
  );
};

export default Badge;