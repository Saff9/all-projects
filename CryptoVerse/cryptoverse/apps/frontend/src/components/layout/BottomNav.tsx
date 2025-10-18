'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTelegram, useHaptics } from '../../hooks';

// ==========================================
// Types
// ==========================================

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  href: string;
  badge?: number | string;
}

export interface BottomNavProps {
  className?: string;
  items?: NavItem[];
}

// ==========================================
// Default Navigation Items
// ==========================================

const defaultNavItems: NavItem[] = [
  {
    id: 'home',
    label: 'Mine',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    href: '/',
  },
  {
    id: 'characters',
    label: 'Heroes',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    href: '/characters',
  },
  {
    id: 'quests',
    label: 'Quests',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    href: '/quests',
  },
  {
    id: 'wallet',
    label: 'Wallet',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    href: '/wallet',
  },
  {
    id: 'leaderboard',
    label: 'Rank',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    activeIcon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    href: '/leaderboard',
  },
];

// ==========================================
// Component
// ==========================================

export const BottomNav: React.FC<BottomNavProps> = ({
  className,
  items = defaultNavItems,
}) => {
  const pathname = usePathname();
  const haptic = useHaptics();

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={twMerge(
        clsx(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-slate-900/95 backdrop-blur-lg',
          'border-t border-white/5',
          'safe-area-bottom',
          className
        )
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = active && item.activeIcon ? item.activeIcon : item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => haptic.light()}
              className="relative flex-1"
            >
              <motion.div
                className={twMerge(
                  clsx(
                    'flex flex-col items-center justify-center py-2 px-3 rounded-xl',
                    'transition-colors duration-200',
                    active
                      ? 'text-purple-400'
                      : 'text-gray-400 hover:text-gray-300'
                  )
                )}
                whileTap={{ scale: 0.9 }}
              >
                {/* Active Background */}
                {active && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute inset-0 bg-purple-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div className="relative z-10">
                  {Icon}
                </div>

                {/* Label */}
                <span
                  className={twMerge(
                    clsx(
                      'relative z-10 text-xs mt-1 font-medium',
                      active ? 'text-purple-400' : 'text-gray-400'
                    )
                  )}
                >
                  {item.label}
                </span>

                {/* Badge */}
                {item.badge !== undefined && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

// ==========================================
// Floating Action Button
// ==========================================

export interface FloatingActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  badge?: number | string;
  color?: 'purple' | 'blue' | 'gold' | 'green';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onClick,
  className,
  badge,
  color = 'purple',
}) => {
  const haptic = useHaptics();

  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
    gold: 'from-yellow-500 to-orange-500 shadow-yellow-500/30',
    green: 'from-green-500 to-green-600 shadow-green-500/30',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => {
        haptic.medium();
        onClick();
      }}
      className={twMerge(
        clsx(
          'fixed bottom-24 right-4 z-50',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br',
          colorClasses[color],
          'shadow-lg',
          'flex items-center justify-center',
          'text-white',
          className
        )
      )}
    >
      {icon}

      {badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1"
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
};

export default BottomNav;