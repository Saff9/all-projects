'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ==========================================
// Types
// ==========================================

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

// ==========================================
// Component
// ==========================================

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  className,
}) => {
  const sizeStyles = {
    sm: 'text-xs py-1.5 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-2.5 px-5',
  };

  const baseStyles = 'font-medium transition-all duration-200 relative';

  const variantStyles = {
    default: {
      container: 'bg-slate-800/50 rounded-xl p-1',
      tab: 'rounded-lg',
      active: 'bg-purple-500 text-white shadow-lg',
      inactive: 'text-gray-400 hover:text-white hover:bg-white/5',
    },
    pills: {
      container: 'gap-2',
      tab: 'rounded-full',
      active: 'bg-purple-500 text-white',
      inactive: 'text-gray-400 hover:text-white bg-slate-800/50',
    },
    underline: {
      container: 'border-b border-white/10 gap-4',
      tab: 'rounded-none border-b-2',
      active: 'border-purple-500 text-white',
      inactive: 'border-transparent text-gray-400 hover:text-white',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className={twMerge(
        clsx(
          'flex',
          variant === 'default' && 'rounded-xl bg-slate-800/50 p-1',
          variant === 'pills' && 'gap-2',
          variant === 'underline' && 'border-b border-white/10 gap-4',
          fullWidth && 'w-full',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onChange(tab.id)}
            disabled={tab.disabled}
            className={twMerge(
              clsx(
                baseStyles,
                sizeStyles[size],
                variant === 'default' && 'rounded-lg',
                variant === 'pills' && 'rounded-full',
                variant === 'underline' && 'rounded-none border-b-2 -mb-px pb-3',
                isActive && variant === 'default' && 'bg-purple-500 text-white shadow-lg',
                isActive && variant === 'pills' && 'bg-purple-500 text-white',
                isActive && variant === 'underline' && 'border-purple-500 text-white',
                !isActive && variant === 'default' && 'text-gray-400 hover:text-white hover:bg-white/5',
                !isActive && variant === 'pills' && 'text-gray-400 hover:text-white bg-slate-800/50',
                !isActive && variant === 'underline' && 'border-transparent text-gray-400 hover:text-white',
                tab.disabled && 'opacity-50 cursor-not-allowed',
                fullWidth && 'flex-1'
              )
            )}
          >
            <span className="flex items-center justify-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && (
                <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                  {tab.badge}
                </span>
              )}
            </span>

            {/* Active indicator for default variant */}
            {isActive && variant === 'default' && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-purple-500 rounded-lg -z-10"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// Segmented Control Variant
// ==========================================

export interface SegmentedControlProps {
  segments: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeSegment: string;
  onChange: (segmentId: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  segments,
  activeSegment,
  onChange,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'relative flex bg-slate-800/50 rounded-xl p-1',
          className
        )
      )}
    >
      {/* Active background */}
      <motion.div
        layoutId="segmentedControlActive"
        className="absolute top-1 bottom-1 bg-purple-500 rounded-lg"
        style={{
          left: `${(segments.findIndex((s) => s.id === activeSegment) / segments.length) * 100}%`,
          width: `${100 / segments.length}%`,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />

      {/* Segments */}
      {segments.map((segment) => (
        <button
          key={segment.id}
          onClick={() => onChange(segment.id)}
          className={twMerge(
            clsx(
              'relative z-10 flex-1 py-2 px-4 text-sm font-medium transition-colors duration-200',
              activeSegment === segment.id ? 'text-white' : 'text-gray-400 hover:text-white'
            )
          )}
        >
          <span className="flex items-center justify-center gap-2">
            {segment.icon}
            {segment.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;