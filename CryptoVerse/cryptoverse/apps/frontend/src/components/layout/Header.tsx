'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { useUser, useWallet, useTelegram } from '../../hooks';
import { formatNumber } from '../../utils/format';

// ==========================================
// Types
// ==========================================

export interface HeaderProps {
  className?: string;
  showBalance?: boolean;
  showLevel?: boolean;
  rightContent?: React.ReactNode;
}

// ==========================================
// Component
// ==========================================

export const Header: React.FC<HeaderProps> = ({
  className,
  showBalance = true,
  showLevel = true,
  rightContent,
}) => {
  const { profile, stats } = useUser();
  const { balance } = useWallet();
  const { haptic } = useTelegram();

  const handleProfileClick = () => {
    haptic?.impact('light');
  };

  return (
    <header
      className={twMerge(
        clsx(
          'fixed top-0 left-0 right-0 z-50',
          'bg-slate-900/80 backdrop-blur-lg',
          'border-b border-white/5',
          className
        )
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: User Info */}
        <Link
          href="/profile"
          onClick={handleProfileClick}
          className="flex items-center gap-3 group"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar
              src={profile?.photoUrl}
              name={profile?.firstName || 'User'}
              size="md"
              showLevel={showLevel}
              level={stats?.level}
              className="ring-2 ring-purple-500/50"
            />
          </motion.div>

          <div className="flex flex-col">
            <span className="font-semibold text-sm group-hover:text-purple-400 transition-colors">
              {profile?.firstName || 'User'}
            </span>
            {showLevel && stats?.level && (
              <span className="text-xs text-gray-400">
                Level {stats.level}
              </span>
            )}
          </div>
        </Link>

        {/* Center: Logo/Title */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              CryptoVerse
            </span>
          </motion.div>
        </div>

        {/* Right: Balance or Custom Content */}
        {rightContent || (
          showBalance && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <Link
                href="/wallet"
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 px-3 py-1.5 rounded-full border border-purple-500/30"
              >
                <span className="text-lg">💎</span>
                <span className="font-semibold text-sm">
                  {formatNumber(balance?.coins ?? 0)}
                </span>
              </Link>
            </motion.div>
          )
        )}
      </div>
    </header>
  );
};

// ==========================================
// Page Header Component
// ==========================================

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  backHref?: string;
  rightContent?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  onBack,
  backHref,
  rightContent,
  className,
}) => {
  const { haptic } = useTelegram();

  const handleBack = () => {
    haptic?.impact('light');
    onBack?.();
  };

  const BackButton = (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleBack}
      className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </motion.button>
  );

  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-between px-4 py-3',
          'bg-slate-900/80 backdrop-blur-lg',
          'border-b border-white/5',
          className
        )
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          backHref ? (
            <Link href={backHref}>{BackButton}</Link>
          ) : (
            BackButton
          )
        )}

        <div className="flex flex-col">
          <h1 className="text-lg font-bold">{title}</h1>
          {subtitle && (
            <span className="text-xs text-gray-400">{subtitle}</span>
          )}
        </div>
      </div>

      {rightContent && (
        <div className="flex items-center gap-2">
          {rightContent}
        </div>
      )}
    </div>
  );
};

// ==========================================
// Stats Header Component
// ==========================================

export interface StatsHeaderProps {
  stats: Array<{
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    color?: string;
  }>;
  className?: string;
}

export const StatsHeader: React.FC<StatsHeaderProps> = ({
  stats,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center justify-around py-3 px-4',
          'bg-gradient-to-r from-purple-500/10 to-blue-500/10',
          'border-b border-white/5',
          className
        )
      )}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-1">
            {stat.icon}
            <span
              className={twMerge(
                clsx('font-bold text-lg', stat.color || 'text-white')
              )}
            >
              {stat.value}
            </span>
          </div>
          <span className="text-xs text-gray-400">{stat.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default Header;