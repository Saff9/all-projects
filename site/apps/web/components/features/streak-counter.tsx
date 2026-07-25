'use client';

import { cn } from '@/lib/utils';
import { Flame, Calendar, Trophy } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  lastActive?: Date;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StreakCounter({
  currentStreak,
  longestStreak,
  lastActive,
  size = 'md',
  className,
}: StreakCounterProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-2 p-3',
      icon: 'h-5 w-5',
      number: 'text-xl',
      label: 'text-xs',
    },
    md: {
      container: 'gap-3 p-4',
      icon: 'h-6 w-6',
      number: 'text-2xl',
      label: 'text-sm',
    },
    lg: {
      container: 'gap-4 p-6',
      icon: 'h-8 w-8',
      number: 'text-3xl',
      label: 'text-base',
    },
  };

  const isStreakActive = lastActive
    ? new Date().getTime() - new Date(lastActive).getTime() < 24 * 60 * 60 * 1000
    : true;

  return (
    <div
      className={cn(
        'flex items-center rounded-xl border bg-gradient-to-br from-orange-500/10 to-red-500/10',
        sizeClasses[size].container,
        className
      )}
    >
      <div
        className={cn(
          'rounded-full p-2',
          isStreakActive ? 'bg-orange-500/20' : 'bg-muted'
        )}
      >
        <Flame
          className={cn(
            sizeClasses[size].icon,
            isStreakActive ? 'text-orange-500' : 'text-muted-foreground'
          )}
        />
      </div>
      <div>
        <div className={cn('font-bold', sizeClasses[size].number)}>
          {currentStreak} day{currentStreak !== 1 ? 's' : ''}
        </div>
        <div className={cn('text-muted-foreground', sizeClasses[size].label)}>
          Current streak
        </div>
      </div>
    </div>
  );
}

// Compact streak display for sidebar/header
interface StreakBadgeProps {
  streak: number;
  className?: string;
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-medium text-orange-600 dark:text-orange-400',
        className
      )}
    >
      <Flame className="h-4 w-4" />
      <span>{streak}</span>
    </div>
  );
}

// Weekly streak calendar view
interface WeeklyStreakProps {
  weekData: Array<{
    date: Date;
    completed: boolean;
  }>;
  className?: string;
}

export function WeeklyStreak({ weekData, className }: WeeklyStreakProps) {
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {weekData.map((day, index) => {
        const dayName = dayNames[new Date(day.date).getDay()];
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{dayName}</span>
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                day.completed
                  ? 'bg-orange-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {day.completed && <Flame className="h-4 w-4" />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Streak milestone display
interface StreakMilestoneProps {
  currentStreak: number;
  milestones?: number[];
  className?: string;
}

export function StreakMilestone({
  currentStreak,
  milestones = [7, 14, 30, 60, 100],
  className,
}: StreakMilestoneProps) {
  const nextMilestone = milestones.find((m) => m > currentStreak);
  const progress = nextMilestone
    ? (currentStreak / nextMilestone) * 100
    : 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Next milestone</span>
        <span className="font-medium">
          {nextMilestone ? `${nextMilestone} days` : 'All milestones achieved!'}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between">
        {milestones.map((milestone) => (
          <div
            key={milestone}
            className={cn(
              'flex items-center gap-1 text-xs',
              currentStreak >= milestone
                ? 'text-orange-500'
                : 'text-muted-foreground'
            )}
          >
            {currentStreak >= milestone ? (
              <Trophy className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3 rounded-full border" />
            )}
            <span>{milestone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
