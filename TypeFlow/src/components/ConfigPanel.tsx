'use client';

import React from 'react';
import { DIFFICULTY_LEVELS, TEST_MODES } from '@/lib/constants';
import type { DifficultyLevel, TestMode } from '@/lib/constants';

interface ConfigPanelProps {
  mode: TestMode;
  difficulty: DifficultyLevel;
  timeLimit?: number;
  wordCount?: number;
  onModeChange: (mode: TestMode) => void;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  onTimeLimitChange?: (timeLimit: number) => void;
  onWordCountChange?: (wordCount: number) => void;
  disabled?: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  mode,
  difficulty,
  timeLimit = 60,
  wordCount = 25,
  onModeChange,
  onDifficultyChange,
  onTimeLimitChange,
  onWordCountChange,
  disabled = false,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Test Mode Selection */}
      <div>
        <label className="block text-sm font-medium text-tertiary mb-3">
          Test Mode
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(Object.entries(TEST_MODES) as [TestMode, typeof TEST_MODES[keyof typeof TEST_MODES]][]).map(
            ([key, config]) => (
              <button
                key={key}
                onClick={() => onModeChange(key)}
                disabled={disabled}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    mode === key
                      ? 'bg-accent text-white shadow-md'
                      : 'bg-surface text-secondary border border-border hover:border-accent hover:text-accent'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="font-medium">{config.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{config.description}</div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div>
        <label className="block text-sm font-medium text-tertiary mb-3">
          Difficulty
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(DIFFICULTY_LEVELS) as [DifficultyLevel, typeof DIFFICULTY_LEVELS[keyof typeof DIFFICULTY_LEVELS]][]).map(
            ([key, config]) => {
              const colorClasses: Record<DifficultyLevel, { [key: string]: string }> = {
                easy: {
                  selected: 'bg-emerald-500 text-white border-emerald-500',
                  unselected: 'bg-surface text-emerald-600 border-emerald-200 hover:border-emerald-400',
                },
                medium: {
                  selected: 'bg-amber-500 text-white border-amber-500',
                  unselected: 'bg-surface text-amber-600 border-amber-200 hover:border-amber-400',
                },
                hard: {
                  selected: 'bg-rose-500 text-white border-rose-500',
                  unselected: 'bg-surface text-rose-600 border-rose-200 hover:border-rose-400',
                },
              };

              return (
                <button
                  key={key}
                  onClick={() => onDifficultyChange(key)}
                  disabled={disabled}
                className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border
                    ${difficulty === key ? colorClasses[key].selected : colorClasses[key].unselected}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div>{config.label}</div>
                  <div className="text-xs opacity-70 mt-1">{config.description}</div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Time Limit Selection (for Time Trial mode) */}
      {mode === 'time' && onTimeLimitChange && (
        <div>
          <label className="block text-sm font-medium text-tertiary mb-3">
            Time Limit
          </label>
          <div className="flex gap-2">
            {TEST_MODES.time.durations.map((duration) => (
              <button
                key={duration}
                onClick={() => onTimeLimitChange(duration)}
                disabled={disabled}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    timeLimit === duration
                      ? 'bg-accent text-white'
                      : 'bg-surface text-secondary border border-border hover:border-accent'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {duration}s
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Word Count Selection (for Words mode) */}
      {mode === 'words' && onWordCountChange && (
        <div>
          <label className="block text-sm font-medium text-tertiary mb-3">
            Word Count
          </label>
          <div className="flex gap-2">
            {TEST_MODES.words.counts.map((count) => (
              <button
                key={count}
                onClick={() => onWordCountChange(count)}
                disabled={disabled}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    wordCount === count
                      ? 'bg-accent text-white'
                      : 'bg-surface text-secondary border border-border hover:border-accent'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {count} words
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ConfigPanel.displayName = 'ConfigPanel';