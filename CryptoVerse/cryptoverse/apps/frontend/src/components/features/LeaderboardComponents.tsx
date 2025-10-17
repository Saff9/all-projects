'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Card';
import { Avatar } from '../common/Avatar';
import { formatNumber, formatWithCommas } from '../../utils/format';

// ==========================================
// Types
// ==========================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  photoUrl?: string;
  score: number;
  level?: number;
  country?: string;
  isCurrentUser?: boolean;
}

// ==========================================
// Leaderboard Row Component
// ==========================================

export interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isHighlighted?: boolean;
  showRank?: boolean;
  className?: string;
}

export const LeaderboardRow: React.FC<LeaderboardRowProps> = ({
  entry,
  isHighlighted = false,
  showRank = true,
  className,
}) => {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-400',
          icon: '🥇',
        };
      case 2:
        return {
          bg: 'bg-gradient-to-r from-slate-400/20 to-gray-400/20',
          border: 'border-slate-400/50',
          text: 'text-slate-300',
          icon: '🥈',
        };
      case 3:
        return {
          bg: 'bg-gradient-to-r from-amber-600/20 to-orange-600/20',
          border: 'border-amber-600/50',
          text: 'text-amber-500',
          icon: '🥉',
        };
      default:
        return {
          bg: '',
          border: 'border-white/5',
          text: 'text-gray-400',
          icon: null,
        };
    }
  };

  const rankStyle = getRankStyle(entry.rank);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={twMerge(
        clsx(
          'flex items-center gap-3 p-3 rounded-xl',
          'border transition-all duration-200',
          rankStyle.bg,
          rankStyle.border,
          isHighlighted && 'ring-2 ring-purple-500/50',
          entry.isCurrentUser && 'bg-purple-500/10',
          className
        )
      )}
    >
      {/* Rank */}
      {showRank && (
        <div className="w-10 flex items-center justify-center">
          {rankStyle.icon ? (
            <span className="text-2xl">{rankStyle.icon}</span>
          ) : (
            <span className={twMerge(clsx('font-bold', rankStyle.text))}>
              #{entry.rank}
            </span>
          )}
        </div>
      )}

      {/* Avatar */}
      <Avatar
        src={entry.photoUrl}
        name={entry.username}
        size="md"
        showLevel={!!entry.level}
        level={entry.level}
      />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <p className={twMerge(clsx(
          'font-semibold truncate',
          entry.isCurrentUser ? 'text-purple-400' : 'text-white'
        ))}>
          {entry.username}
          {entry.isCurrentUser && ' (You)'}
        </p>
        {entry.country && (
          <p className="text-xs text-gray-400">{entry.country}</p>
        )}
      </div>

      {/* Score */}
      <div className="text-right">
        <p className="font-bold text-white">
          {formatWithCommas(entry.score)}
        </p>
        <p className="text-xs text-gray-400">💎 tokens</p>
      </div>
    </motion.div>
  );
};

// ==========================================
// Leaderboard List Component
// ==========================================

export interface LeaderboardListProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  isLoading?: boolean;
  className?: string;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  entries,
  currentUserId,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return (
      <div className={twMerge(clsx('space-y-3', className))}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-slate-800/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={twMerge(clsx('text-center py-8', className))}>
        <span className="text-4xl mb-2 block">🏆</span>
        <p className="text-gray-400">No entries yet</p>
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('space-y-2', className))}>
      {entries.map((entry, index) => (
        <LeaderboardRow
          key={entry.userId}
          entry={entry}
          isHighlighted={entry.userId === currentUserId}
        />
      ))}
    </div>
  );
};

// ==========================================
// Leaderboard Tabs Component
// ==========================================

export interface LeaderboardTabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const LeaderboardTabs: React.FC<LeaderboardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div className={twMerge(clsx('flex gap-2', className))}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={twMerge(
            clsx(
              'flex-1 py-2 px-4 rounded-lg font-semibold text-sm transition-colors',
              activeTab === tab.id
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
            )
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ==========================================
// Leaderboard Header Component
// ==========================================

export interface LeaderboardHeaderProps {
  title: string;
  timeframe: string;
  userRank?: number;
  userScore?: number;
  className?: string;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  title,
  timeframe,
  userRank,
  userScore,
  className,
}) => {
  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-sm text-gray-400">{timeframe}</p>
        </div>
        {userRank !== undefined && (
          <div className="text-right">
            <p className="text-sm text-gray-400">Your Rank</p>
            <p className="text-2xl font-bold text-purple-400">#{userRank}</p>
            {userScore !== undefined && (
              <p className="text-xs text-gray-400">
                {formatNumber(userScore)} 💎
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

// ==========================================
// Top 3 Podium Component
// ==========================================

export interface TopThreeProps {
  entries: [LeaderboardEntry?, LeaderboardEntry?, LeaderboardEntry?];
  className?: string;
}

export const TopThree: React.FC<TopThreeProps> = ({ entries, className }) => {
  const [first, second, third] = entries;

  return (
    <div className={twMerge(clsx('flex items-end justify-center gap-4 mb-6', className))}>
      {/* Second Place */}
      <div className="flex flex-col items-center">
        {second && (
          <>
            <Avatar
              src={second.photoUrl}
              name={second.username}
              size="lg"
              className="ring-4 ring-slate-400"
            />
            <div className="mt-2 text-center">
              <p className="font-semibold text-sm truncate max-w-[80px]">
                {second.username}
              </p>
              <p className="text-xs text-gray-400">
                {formatNumber(second.score)}
              </p>
            </div>
          </>
        )}
        <div className="w-20 h-20 bg-gradient-to-t from-slate-600 to-slate-500 rounded-t-lg mt-2 flex items-center justify-center">
          <span className="text-3xl">🥈</span>
        </div>
      </div>

      {/* First Place */}
      <div className="flex flex-col items-center">
        {first && (
          <>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Avatar
                src={first.photoUrl}
                name={first.username}
                size="xl"
                className="ring-4 ring-yellow-400"
              />
            </motion.div>
            <div className="mt-2 text-center">
              <p className="font-bold truncate max-w-[80px]">
                {first.username}
              </p>
              <p className="text-sm text-yellow-400">
                {formatNumber(first.score)}
              </p>
            </div>
          </>
        )}
        <div className="w-24 h-28 bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg mt-2 flex items-center justify-center">
          <span className="text-4xl">🥇</span>
        </div>
      </div>

      {/* Third Place */}
      <div className="flex flex-col items-center">
        {third && (
          <>
            <Avatar
              src={third.photoUrl}
              name={third.username}
              size="lg"
              className="ring-4 ring-amber-600"
            />
            <div className="mt-2 text-center">
              <p className="font-semibold text-sm truncate max-w-[80px]">
                {third.username}
              </p>
              <p className="text-xs text-gray-400">
                {formatNumber(third.score)}
              </p>
            </div>
          </>
        )}
        <div className="w-20 h-16 bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg mt-2 flex items-center justify-center">
          <span className="text-3xl">🥉</span>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardList;