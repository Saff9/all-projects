'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { formatNumber, formatRelativeTime } from '../../utils/format';
import { QUEST_TYPES } from '../../utils/constants';

// ==========================================
// Types
// ==========================================

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'special' | 'achievement';
  status: 'available' | 'in_progress' | 'completed' | 'claimed';
  requirement: number;
  progress: number;
  rewards: {
    tokens: number;
    xp?: number;
    items?: string[];
  };
  expiresAt?: string | Date;
  startedAt?: string | Date;
  completedAt?: string | Date;
}

// ==========================================
// Quest Card Component
// ==========================================

export interface QuestCardProps {
  quest: Quest;
  onStart?: () => void;
  onComplete?: () => void;
  onClaim?: () => void;
  isProcessing?: boolean;
  className?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  onStart,
  onComplete,
  onClaim,
  isProcessing = false,
  className,
}) => {
  const progressPercentage = Math.min(100, (quest.progress / quest.requirement) * 100);
  const isExpired = quest.expiresAt && new Date(quest.expiresAt) < new Date();

  const getTypeColor = (type: Quest['type']) => {
    switch (type) {
      case 'daily':
        return 'text-blue-400';
      case 'weekly':
        return 'text-purple-400';
      case 'special':
        return 'text-yellow-400';
      case 'achievement':
        return 'text-green-400';
      default:
        return 'text-white';
    }
  };

  const getTypeBg = (type: Quest['type']) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-500/20';
      case 'weekly':
        return 'bg-purple-500/20';
      case 'special':
        return 'bg-yellow-500/20';
      case 'achievement':
        return 'bg-green-500/20';
      default:
        return 'bg-slate-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-slate-800 to-slate-900',
          'border border-white/10',
          quest.status === 'completed' && 'border-green-500/30',
          isExpired && 'opacity-50',
          className
        )
      )}
    >
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant="default"
                size="sm"
                className={twMerge(clsx('capitalize', getTypeColor(quest.type), getTypeBg(quest.type)))}
              >
                {quest.type}
              </Badge>
              {quest.status === 'completed' && (
                <Badge variant="success" size="sm">
                  ✓ Done
                </Badge>
              )}
            </div>
            <h3 className="font-bold">{quest.name}</h3>
          </div>
        </div>
        <p className="text-sm text-gray-400">{quest.description}</p>
      </div>

      {/* Progress */}
      {quest.status === 'in_progress' && (
        <div className="px-4 pb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-400">
              {quest.progress}/{quest.requirement}
            </span>
          </div>
          <ProgressBar value={progressPercentage} size="sm" />
        </div>
      )}

      {/* Rewards */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span>💎</span>
            <span className="text-yellow-400 font-semibold">
              +{formatNumber(quest.rewards.tokens)}
            </span>
          </div>
          {quest.rewards.xp && (
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span className="text-blue-400 font-semibold">
                +{quest.rewards.xp} XP
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timer */}
      {quest.expiresAt && quest.status !== 'claimed' && (
        <div className="px-4 pb-2">
          <span className="text-xs text-gray-400">
            {isExpired ? 'Expired' : `Expires ${formatRelativeTime(quest.expiresAt)}`}
          </span>
        </div>
      )}

      {/* Action Button */}
      <div className="p-4 pt-2">
        {quest.status === 'available' && !isExpired && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            onClick={onStart}
            isLoading={isProcessing}
          >
            Start Quest
          </Button>
        )}
        {quest.status === 'in_progress' && !isExpired && (
          <Button
            variant="secondary"
            size="sm"
            fullWidth
            disabled
          >
            In Progress ({quest.progress}/{quest.requirement})
          </Button>
        )}
        {quest.status === 'completed' && (
          <Button
            variant="success"
            size="sm"
            fullWidth
            onClick={onClaim}
            isLoading={isProcessing}
          >
            Claim Reward
          </Button>
        )}
        {quest.status === 'claimed' && (
          <div className="text-center text-sm text-green-400">
            ✓ Claimed
          </div>
        )}
        {isExpired && quest.status !== 'claimed' && (
          <div className="text-center text-sm text-red-400">
            ⏰ Expired
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================
// Quest List Component
// ==========================================

export interface QuestListProps {
  quests: Quest[];
  onStart?: (quest: Quest) => void;
  onComplete?: (quest: Quest) => void;
  onClaim?: (quest: Quest) => void;
  processingId?: string | null;
  className?: string;
}

export const QuestList: React.FC<QuestListProps> = ({
  quests,
  onStart,
  onComplete,
  onClaim,
  processingId,
  className,
}) => {
  if (quests.length === 0) {
    return (
      <div className={twMerge(clsx('text-center py-8', className))}>
        <span className="text-4xl mb-2 block">📜</span>
        <p className="text-gray-400">No quests available</p>
      </div>
    );
  }

  return (
    <div className={twMerge(clsx('space-y-4', className))}>
      {quests.map((quest) => (
        <QuestCard
          key={quest.id}
          quest={quest}
          onStart={() => onStart?.(quest)}
          onComplete={() => onComplete?.(quest)}
          onClaim={() => onClaim?.(quest)}
          isProcessing={processingId === quest.id}
        />
      ))}
    </div>
  );
};

// ==========================================
// Daily Quests Section
// ==========================================

export interface DailyQuestsProps {
  quests: Quest[];
  onStart?: (quest: Quest) => void;
  onClaim?: (quest: Quest) => void;
  processingId?: string | null;
  className?: string;
}

export const DailyQuests: React.FC<DailyQuestsProps> = ({
  quests,
  onStart,
  onClaim,
  processingId,
  className,
}) => {
  const completedCount = quests.filter((q) => q.status === 'claimed').length;
  const totalRewards = quests.reduce((sum, q) => sum + q.rewards.tokens, 0);

  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg">Daily Quests</h3>
          <p className="text-sm text-gray-400">
            {completedCount}/{quests.length} completed
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Total Rewards</p>
          <p className="font-bold text-yellow-400">
            +{formatNumber(totalRewards)} 💎
          </p>
        </div>
      </div>

      {/* Quest List */}
      <QuestList
        quests={quests}
        onStart={onStart}
        onClaim={onClaim}
        processingId={processingId}
      />
    </Card>
  );
};

// ==========================================
// Quest Progress Summary
// ==========================================

export interface QuestProgressProps {
  daily: { completed: number; total: number };
  weekly: { completed: number; total: number };
  className?: string;
}

export const QuestProgress: React.FC<QuestProgressProps> = ({
  daily,
  weekly,
  className,
}) => {
  return (
    <div className={twMerge(clsx('grid grid-cols-2 gap-4', className))}>
      <Card variant="glass" className="p-4 text-center">
        <p className="text-2xl font-bold text-blue-400">
          {daily.completed}/{daily.total}
        </p>
        <p className="text-sm text-gray-400">Daily Quests</p>
      </Card>
      <Card variant="glass" className="p-4 text-center">
        <p className="text-2xl font-bold text-purple-400">
          {weekly.completed}/{weekly.total}
        </p>
        <p className="text-sm text-gray-400">Weekly Quests</p>
      </Card>
    </div>
  );
};

export default QuestCard;