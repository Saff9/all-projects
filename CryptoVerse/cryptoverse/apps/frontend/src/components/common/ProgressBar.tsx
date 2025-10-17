'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export type ProgressBarVariant = 'default' | 'gradient' | 'striped' | 'animated';
export type ProgressBarColor = 'purple' | 'blue' | 'green' | 'yellow' | 'red' | 'gold' | string;

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressBarVariant;
  color?: ProgressBarColor;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

// ==========================================
// Styles
// ==========================================

const colorStyles: Record<ProgressBarColor, string> = {
  purple: 'bg-purple-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  red: 'bg-red-500',
  gold: 'bg-gradient-to-r from-yellow-400 to-amber-500',
};

const gradientStyles: Record<ProgressBarColor, string> = {
  purple: 'bg-gradient-to-r from-purple-600 to-blue-500',
  blue: 'bg-gradient-to-r from-blue-600 to-cyan-500',
  green: 'bg-gradient-to-r from-green-600 to-emerald-500',
  yellow: 'bg-gradient-to-r from-yellow-600 to-orange-500',
  red: 'bg-gradient-to-r from-red-600 to-pink-500',
  gold: 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600',
};

const sizeStyles: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

// ==========================================
// Component
// ==========================================

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  variant = 'default',
  color = 'purple',
  size = 'md',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const getBarColor = () => {
    if (variant === 'gradient') {
      return gradientStyles[color];
    }
    return colorStyles[color];
  };

  return (
    <div className={twMerge('w-full', className)}>
      {/* Label */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-400">{label}</span>
          <span className="text-sm font-medium text-white">
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        className={clsx(
          'w-full bg-slate-700/50 rounded-full overflow-hidden',
          sizeStyles[size]
        )}
      >
        {/* Progress Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
          className={clsx(
            'h-full rounded-full relative overflow-hidden',
            getBarColor(),
            variant === 'striped' && 'striped-progress'
          )}
        >
          {/* Animated Shine Effect */}
          {variant === 'animated' && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </motion.div>
      </div>

      {/* Percentage */}
      {showLabel && (
        <div className="mt-1 text-right">
          <span className="text-xs text-slate-500">{percentage.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Circular Progress
// ==========================================

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: ProgressBarColor;
  showValue?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  color = 'purple',
  showValue = true,
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const getColorClass = () => {
    const colors: Record<ProgressBarColor, string> = {
      purple: 'stroke-purple-500',
      blue: 'stroke-blue-500',
      green: 'stroke-green-500',
      yellow: 'stroke-yellow-500',
      red: 'stroke-red-500',
      gold: 'stroke-amber-500',
    };
    return colors[color];
  };

  return (
    <div className={twMerge('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={getColorClass()}
        />
      </svg>
      {/* Value Display */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// Energy Bar (Specialized for Mining)
// ==========================================

export interface EnergyBarProps {
  current: number;
  max: number;
  regenerating?: boolean;
  className?: string;
}

export const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max,
  regenerating = false,
  className,
}) => {
  const percentage = (current / max) * 100;

  return (
    <div className={twMerge('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-white flex items-center gap-1">
          ⚡ Energy
          {regenerating && (
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </span>
        <span className="text-sm text-slate-400">
          {current.toLocaleString()} / {max.toLocaleString()}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-700/50 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
          className={clsx(
            'h-full rounded-full',
            percentage > 50
              ? 'bg-gradient-to-r from-green-500 to-emerald-400'
              : percentage > 25
              ? 'bg-gradient-to-r from-yellow-500 to-orange-400'
              : 'bg-gradient-to-r from-red-500 to-pink-400'
          )}
        />
      </div>
    </div>
  );
};

export default ProgressBar;