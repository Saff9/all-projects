'use client';

import React from 'react';
import type { TestResult } from '@/lib/types';
import { formatTime, formatDateTime } from '@/lib/utils';
import { getDifficultyColor, getModeLabel } from '@/lib/utils';

interface ResultsPanelProps {
  result: TestResult;
  isNewBest?: boolean;
  onRestart: () => void;
  onBackToHome: () => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  result,
  isNewBest = false,
  onRestart,
  onBackToHome,
}) => {
  const getGrade = () => {
    if (result.wpm >= 80 && result.accuracy >= 98) return { grade: 'S+', color: 'text-yellow-500' };
    if (result.wpm >= 60 && result.accuracy >= 95) return { grade: 'S', color: 'text-yellow-500' };
    if (result.wpm >= 50 && result.accuracy >= 90) return { grade: 'A', color: 'text-green-500' };
    if (result.wpm >= 40 && result.accuracy >= 85) return { grade: 'B', color: 'text-blue-500' };
    if (result.wpm >= 30 && result.accuracy >= 80) return { grade: 'C', color: 'text-amber-500' };
    return { grade: 'D', color: 'text-red-500' };
  };

  const { grade, color } = getGrade();

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">
          Test Complete!
        </h2>
        {isNewBest && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-sm font-medium">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            New Best Score!
          </div>
        )}
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* WPM */}
        <div className="card text-center">
          <div className="text-sm text-tertiary mb-1">WPM</div>
          <div className="text-3xl md:text-4xl font-bold text-primary stat-value">
            {result.wpm}
          </div>
        </div>

        {/* Accuracy */}
        <div className="card text-center">
          <div className="text-sm text-tertiary mb-1">Accuracy</div>
          <div
            className={`text-3xl md:text-4xl font-bold stat-value ${
              result.accuracy >= 95
                ? 'text-success'
                : result.accuracy >= 80
                ? 'text-warning'
                : 'text-error'
            }`}
          >
            {result.accuracy}%
          </div>
        </div>

        {/* Grade */}
        <div className="card text-center">
          <div className="text-sm text-tertiary mb-1">Grade</div>
          <div className={`text-3xl md:text-4xl font-bold ${color}`}>
            {grade}
          </div>
        </div>

        {/* Consistency */}
        <div className="card text-center">
          <div className="text-sm text-tertiary mb-1">Consistency</div>
          <div
            className={`text-3xl md:text-4xl font-bold stat-value ${
              result.consistency >= 80
                ? 'text-success'
                : result.consistency >= 60
                ? 'text-warning'
                : 'text-error'
            }`}
          >
            {result.consistency}%
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="card mb-8">
        <h3 className="text-sm font-medium text-tertiary mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-tertiary">Raw WPM</div>
            <div className="text-lg font-semibold text-primary stat-value">
              {result.rawWpm}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Characters</div>
            <div className="text-lg font-semibold text-primary stat-value">
              {result.charactersTyped}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Words</div>
            <div className="text-lg font-semibold text-primary stat-value">
              {result.wordsTyped}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Correct Chars</div>
            <div className="text-lg font-semibold text-success stat-value">
              {result.correctCharacters}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Errors</div>
            <div
              className={`text-lg font-semibold stat-value ${
                result.errors === 0
                  ? 'text-success'
                  : result.errors <= 3
                  ? 'text-warning'
                  : 'text-error'
              }`}
            >
              {result.errors}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Duration</div>
            <div className="text-lg font-semibold text-primary stat-value">
              {formatTime(result.duration)}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Avg Time/Char</div>
            <div className="text-lg font-semibold text-primary stat-value">
              {result.averageTimePerChar}ms
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Mode</div>
            <div className="text-lg font-semibold text-primary">
              {getModeLabel(result.mode)}
            </div>
          </div>
          <div>
            <div className="text-xs text-tertiary">Difficulty</div>
            <div className={`inline-flex px-2 py-0.5 rounded text-sm font-medium ${getDifficultyColor(result.difficulty)}`}>
              {result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={onRestart}
          className="btn btn-primary px-8 py-3 text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
        <button
          onClick={onBackToHome}
          className="btn btn-secondary px-8 py-3 text-base"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
          </svg>
          Back to Home
        </button>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-tertiary">
        Completed at {formatDateTime(new Date(result.endTime).toISOString())}
      </div>
    </div>
  );
};

ResultsPanel.displayName = 'ResultsPanel';