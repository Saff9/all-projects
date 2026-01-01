'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTypingEngine } from '@/hooks/useTypingEngine';
import { TypingArea } from '@/components/TypingArea';
import { StatsDisplay } from '@/components/StatsDisplay';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ResultsPanel } from '@/components/ResultsPanel';
import type { DifficultyLevel, TestMode } from '@/lib/constants';
import { loadBestScores, updateBestScore, addToHistory, updateStats } from '@/lib/utils';
import { DIFFICULTY_LEVELS } from '@/lib/constants';

export default function Home() {
  const {
    state,
    result,
    initializeTest,
    handleKeyPress,
    handleBackspace,
    resetTest,
    updateConfig,
    getRemainingTime,
  } = useTypingEngine();

  const [isFocused, setIsFocused] = useState(true);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // Initialize test on mount
  useEffect(() => {
    initializeTest({
      mode: 'time',
      difficulty: 'medium',
      timeLimit: 60,
    });
  }, [initializeTest]);

  // Handle test completion
  useEffect(() => {
    if (state.status === 'completed' && result) {
      // Check for new best score
      const bestScores = loadBestScores();
      const key = `${result.mode}_${result.difficulty}`;
      const existing = bestScores[key];
      if (!existing || result.wpm > existing.wpm) {
        setIsNewBest(updateBestScore(result));
      } else {
        setIsNewBest(false);
      }

      // Save to history and update stats
      addToHistory(result);
      updateStats(result);
    }
  }, [state.status, result]);

  // Handle mode change
  const handleModeChange = useCallback(
    (mode: TestMode) => {
      updateConfig({ mode });
      // Reset with new config
      setTimeout(() => {
        initializeTest({
          mode,
          difficulty: state.config.difficulty,
          timeLimit: mode === 'time' ? 60 : undefined,
          wordCount: mode === 'words' ? DIFFICULTY_LEVELS[state.config.difficulty].wordCount : undefined,
        });
      }, 0);
    },
    [updateConfig, initializeTest, state.config.difficulty]
  );

  // Handle difficulty change
  const handleDifficultyChange = useCallback(
    (difficulty: DifficultyLevel) => {
      updateConfig({ difficulty });
      setTimeout(() => {
        initializeTest({
          mode: state.config.mode,
          difficulty,
          timeLimit: state.config.timeLimit,
          wordCount: state.config.mode === 'words' ? DIFFICULTY_LEVELS[difficulty].wordCount : undefined,
        });
      }, 0);
    },
    [updateConfig, initializeTest, state.config.mode, state.config.timeLimit]
  );

  // Handle time limit change
  const handleTimeLimitChange = useCallback(
    (timeLimit: number) => {
      updateConfig({ timeLimit });
      setTimeout(() => {
        initializeTest({
          mode: 'time',
          difficulty: state.config.difficulty,
          timeLimit,
        });
      }, 0);
    },
    [updateConfig, initializeTest, state.config.difficulty]
  );

  // Handle word count change
  const handleWordCountChange = useCallback(
    (wordCount: number) => {
      updateConfig({ wordCount });
      setTimeout(() => {
        initializeTest({
          mode: 'words',
          difficulty: state.config.difficulty,
          wordCount,
        });
      }, 0);
    },
    [updateConfig, initializeTest, state.config.difficulty]
  );

  // Handle restart
  const handleRestart = useCallback(() => {
    setIsNewBest(false);
    resetTest();
  }, [resetTest]);

  // Handle back to home
  const handleBackToHome = useCallback(() => {
    setIsNewBest(false);
    initializeTest({
      mode: 'time',
      difficulty: 'medium',
      timeLimit: 60,
    });
  }, [initializeTest]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Tab to restart
      if (e.key === 'Tab' && state.status === 'completed') {
        e.preventDefault();
        handleRestart();
      }

      // Escape to blur / show config
      if (e.key === 'Escape') {
        if (state.status === 'running') {
          setIsFocused(false);
        } else if (!showConfig) {
          setShowConfig(true);
        } else {
          setShowConfig(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state.status, showConfig, handleRestart]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">TypeFlow</h1>
              <p className="text-xs text-tertiary">Professional Typing Test</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="btn btn-ghost p-2"
              aria-label="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {state.status === 'completed' && result ? (
          <ResultsPanel
            result={result}
            isNewBest={isNewBest}
            onRestart={handleRestart}
            onBackToHome={handleBackToHome}
          />
        ) : (
          <div className="space-y-8">
            {/* Live Stats */}
            <StatsDisplay
              wpm={state.currentWpm}
              accuracy={state.accuracy}
              time={state.elapsedTime}
              errors={state.errors}
              mode={state.config.mode}
              timeLimit={state.config.timeLimit}
              showLiveWpm={true}
            />

            {/* Config Panel (Collapsible) */}
            {showConfig && (
              <div className="animate-fade-in">
                <ConfigPanel
                  mode={state.config.mode}
                  difficulty={state.config.difficulty}
                  timeLimit={state.config.timeLimit}
                  wordCount={state.config.wordCount}
                  onModeChange={handleModeChange}
                  onDifficultyChange={handleDifficultyChange}
                  onTimeLimitChange={handleTimeLimitChange}
                  onWordCountChange={handleWordCountChange}
                  disabled={state.status === 'running'}
                />
              </div>
            )}

            {/* Typing Area */}
            <div className="relative">
              <TypingArea
                state={state}
                onKeyPress={handleKeyPress}
                onBackspace={handleBackspace}
                disabled={state.status === 'completed'}
                focused={isFocused}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />

              {/* Focus hint */}
              {!isFocused && state.status !== 'completed' && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-xl">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-tertiary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <p className="text-secondary">Click to focus and start typing</p>
                    <p className="text-tertiary text-sm mt-1">or press any key</p>
                  </div>
                </div>
              )}
            </div>

            {/* Keyboard Shortcuts */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-tertiary">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">Tab</kbd>
                Restart
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">Esc</kbd>
                Settings
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-surface border border-border rounded text-xs">Space</kbd>
                Space
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-tertiary">
          <p>TypeFlow — Professional Typing Speed Test</p>
          <p className="mt-1">
            Built with Next.js 16 & Tailwind CSS
          </p>
          <VisitorStats />
        </div>
      </footer>
    </div>
  );
}

import { VisitorStats } from '@/components/VisitorStats';
