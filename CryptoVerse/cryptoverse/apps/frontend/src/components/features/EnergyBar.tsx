'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatEnergy, formatCountdown } from '../../utils/format';

// ==========================================
// Types
// ==========================================

export interface EnergyBarProps {
  current: number;
  max: number;
  regenRate?: number; // energy per second
  showTimer?: boolean;
  className?: string;
}

// ==========================================
// Component
// ==========================================

export const EnergyBar: React.FC<EnergyBarProps> = ({
  current,
  max,
  regenRate = 1,
  showTimer = true,
  className,
}) => {
  const percentage = Math.min(100, (current / max) * 100);
  const isLow = percentage < 20;
  const isFull = current >= max;
  
  // Calculate time to full
  const timeToFull = Math.ceil((max - current) / regenRate);

  return (
    <div className={twMerge(clsx('w-full', className))}>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-semibold text-sm">Energy</span>
        </div>
        <span
          className={twMerge(
            clsx(
              'font-bold text-sm',
              isLow ? 'text-red-400' : 'text-white'
            )
          )}
        >
          {formatEnergy(current, max)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10" />
        
        {/* Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={twMerge(
            clsx(
              'absolute inset-y-0 left-0 rounded-full',
              isLow
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-purple-500 to-blue-500',
              'shadow-lg',
              isLow ? 'shadow-red-500/30' : 'shadow-purple-500/30'
            )
          )}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          
          {/* Animated pulse */}
          {!isFull && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
          )}
        </motion.div>

        {/* Full indicator */}
        {isFull && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white drop-shadow-lg">
              FULL
            </span>
          </motion.div>
        )}
      </div>

      {/* Timer */}
      {showTimer && !isFull && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center mt-2"
        >
          <span className="text-xs text-gray-400">
            Full in {formatCountdown(timeToFull)}
          </span>
        </motion.div>
      )}
    </div>
  );
};

// ==========================================
// Compact Energy Display
// ==========================================

export interface CompactEnergyProps {
  current: number;
  max: number;
  className?: string;
}

export const CompactEnergy: React.FC<CompactEnergyProps> = ({
  current,
  max,
  className,
}) => {
  const percentage = Math.min(100, (current / max) * 100);
  const isLow = percentage < 20;

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-slate-800/50 border border-white/10',
          className
        )
      )}
    >
      <span className="text-sm">⚡</span>
      <div className="flex items-center gap-2">
        <span
          className={twMerge(
            clsx('font-semibold text-sm', isLow ? 'text-red-400' : 'text-white')
          )}
        >
          {current}
        </span>
        <span className="text-xs text-gray-400">/ {max}</span>
      </div>
      
      {/* Mini progress bar */}
      <div className="w-12 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={twMerge(
            clsx(
              'h-full rounded-full',
              isLow
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-purple-500 to-blue-500'
            )
          )}
        />
      </div>
    </div>
  );
};

// ==========================================
// Energy Boost Indicator
// ==========================================

export interface EnergyBoostProps {
  multiplier: number;
  remainingTime: number; // seconds
  className?: string;
}

export const EnergyBoost: React.FC<EnergyBoostProps> = ({
  multiplier,
  remainingTime,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={twMerge(
        clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          'border border-green-500/30',
          className
        )
      )}
    >
      <span className="text-lg">🚀</span>
      <div className="flex flex-col">
        <span className="font-bold text-sm text-green-400">
          {multiplier}x Energy Boost
        </span>
        <span className="text-xs text-gray-400">
          {formatCountdown(remainingTime)} remaining
        </span>
      </div>
    </motion.div>
  );
};

export default EnergyBar;