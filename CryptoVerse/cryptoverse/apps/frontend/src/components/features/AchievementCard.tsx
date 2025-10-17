'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { ACHIEVEMENT_TIER_COLORS } from '../../utils/constants';
import { formatNumber } from '../../utils/format';

// ==========================================
// Types
// ==========================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: string;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  requirement: number;
  progress: number;
  reward: number;
  isCompleted: boolean;
  isClaimed: boolean;
  claimedAt?: string | Date;
}

// ==========================================
// Achievement Card Component
// ==========================================

export interface AchievementCardProps {
  achievement: Achievement;
  onClaim?: () => void;
  isClaiming?: boolean;
  compact?: boolean;
  className?: string;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onClaim,
  isClaiming = false,
  compact = false,
  className,
}) => {
  const progressPercentage = Math.min(100, (achievement.progress / achievement.requirement) * 100);
  const tierColor = achievement.tier ? ACHIEVEMENT_TIER_COLORS[achievement.tier] : '#9CA3AF';

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={twMerge(
          clsx(
            'relative p-3 rounded-xl',
            'bg-slate-800/50 border border-white/10',
            achievement.isCompleted && !achievement.isClaimed && 'border-yellow-500/50',
            achievement.isClaimed && 'opacity-60',
            className
          )
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            {achievement.isClaimed ? '✅' : achievement.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{achievement.name}</p>
            <p className="text-xs text-gray-400">
              {achievement.isCompleted ? 'Completed' : `${achievement.progress}/${achievement.requirement}`}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={twMerge(
        clsx(
          'relative overflow-hidden rounded-2xl',
          'bg-gradient-to-br from-slate-800 to-slate-900',
          'border transition-all duration-300',
          achievement.isCompleted && !achievement.isClaimed && 'border-yellow-500/50',
          achievement.isClaimed && 'opacity-60',
          className
        )
      )}
      style={{
        borderColor: achievement.isClaimed ? 'rgba(255,255,255,0.1)' : `${tierColor}30`,
      }}
    >
      {/* Background glow for completed */}
      {achievement.isCompleted && !achievement.isClaimed && (
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${tierColor} 0%, transparent 50%)`,
          }}
        />
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${tierColor}20` }}
          >
            {achievement.isClaimed ? '✅' : achievement.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold">{achievement.name}</h3>
              {achievement.tier && (
                <Badge
                  variant="default"
                  size="sm"
                  className="capitalize"
                  style={{ backgroundColor: `${tierColor}30`, color: tierColor }}
                >
                  {achievement.tier}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">{achievement.description}</p>
          </div>
        </div>

        {/* Progress */}
        {!achievement.isClaimed && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-gray-400">
                {formatNumber(achievement.progress)} / {formatNumber(achievement.requirement)}
              </span>
            </div>
            <ProgressBar
              value={progressPercentage}
              color={tierColor}
              size="sm"
            />
          </div>
        )}

        {/* Reward */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Reward:</span>
            <span className="font-bold text-yellow-400">
              +{formatNumber(achievement.reward)} 💎
            </span>
          </div>

          {/* Claim Button */}
          {achievement.isCompleted && !achievement.isClaimed && (
            <Button
              variant="primary"
              size="sm"
              onClick={onClaim}
              isLoading={isClaiming}
            >
              Claim
            </Button>
          )}

          {achievement.isClaimed && (
            <span className="text-xs text-green-400">Claimed ✓</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ==========================================
// Achievement Grid Component
// ==========================================

export interface AchievementGridProps {
  achievements: Achievement[];
  onClaim?: (achievement: Achievement) => void;
  claimingId?: string | null;
  compact?: boolean;
  className?: string;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onClaim,
  claimingId,
  compact = false,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'grid gap-4',
          compact ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
          className
        )
      )}
    >
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          onClaim={() => onClaim?.(achievement)}
          isClaiming={claimingId === achievement.id}
          compact={compact}
        />
      ))}
    </div>
  );
};

// ==========================================
// Achievement Progress Summary
// ==========================================

export interface AchievementProgressProps {
  total: number;
  completed: number;
  claimed: number;
  className?: string;
}

export const AchievementProgress: React.FC<AchievementProgressProps> = ({
  total,
  completed,
  claimed,
  className,
}) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card variant="glass" className={twMerge(clsx('p-4', className))}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Achievement Progress</h3>
        <span className="text-sm text-gray-400">
          {completed}/{total}
        </span>
      </div>

      <ProgressBar value={percentage} color="#F59E0B" className="mb-3" />

      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold text-white">{total}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div>
          <p className="text-lg font-bold text-green-400">{completed}</p>
          <p className="text-xs text-gray-400">Completed</p>
        </div>
        <div>
          <p className="text-lg font-bold text-yellow-400">{claimed}</p>
          <p className="text-xs text-gray-400">Claimed</p>
        </div>
      </div>
    </Card>
  );
};

export default AchievementCard;