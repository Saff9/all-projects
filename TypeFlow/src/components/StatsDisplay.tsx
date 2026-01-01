'use client';

import React from 'react';
import { formatTime } from '@/lib/utils';

interface StatsDisplayProps {
  wpm: number;
  accuracy: number;
  time?: number;
  errors?: number;
  progress?: number;
  showLiveWpm?: boolean;
  mode?: 'time' | 'words' | 'quote' | 'custom';
  timeLimit?: number;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({
  wpm,
  accuracy,
  time = 0,
  errors = 0,
  progress = 0,
  showLiveWpm = true,
  mode = 'time',
  timeLimit,
}) => {
  const displayTime = mode === 'time' && timeLimit ? timeLimit - time : time;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      {mode === 'time' && timeLimit && (
        <div className="mb-4">
          <div className="progress-bar h-1">
            <div
              className="progress-bar-fill bg-accent"
              style={{ width: `${Math.min(100, (time / timeLimit) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* WPM */}
        <div className="text-center p-4 rounded-lg bg-surface/50 border border-border">
          <div className="text-xs text-tertiary uppercase tracking-wider mb-1">
            {showLiveWpm ? 'Live WPM' : 'WPM'}
          </div>
          <div className="stat-value text-3xl md:text-4xl font-bold text-primary">
            {wpm}
          </div>
        </div>

        {/* Accuracy */}
        <div className="text-center p-4 rounded-lg bg-surface/50 border border-border">
          <div className="text-xs text-tertiary uppercase tracking-wider mb-1">
            Accuracy
          </div>
          <div
            className={`stat-value text-3xl md:text-4xl font-bold ${
              accuracy >= 95
                ? 'text-success'
                : accuracy >= 80
                ? 'text-warning'
                : 'text-error'
            }`}
          >
            {accuracy}%
          </div>
        </div>

        {/* Time */}
        <div className="text-center p-4 rounded-lg bg-surface/50 border border-border">
          <div className="text-xs text-tertiary uppercase tracking-wider mb-1">
            {mode === 'time' ? 'Time Left' : 'Time'}
          </div>
          <div
            className={`stat-value text-3xl md:text-4xl font-bold ${
              mode === 'time' && displayTime <= 10 ? 'text-error' : 'text-primary'
            }`}
          >
            {formatTime(Math.max(0, displayTime))}
          </div>
        </div>

        {/* Errors */}
        <div className="text-center p-4 rounded-lg bg-surface/50 border border-border">
          <div className="text-xs text-tertiary uppercase tracking-wider mb-1">
            Errors
          </div>
          <div
            className={`stat-value text-3xl md:text-4xl font-bold ${
              errors === 0
                ? 'text-success'
                : errors <= 3
                ? 'text-warning'
                : 'text-error'
            }`}
          >
            {errors}
          </div>
        </div>
      </div>
    </div>
  );
};

StatsDisplay.displayName = 'StatsDisplay';