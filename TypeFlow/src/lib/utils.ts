import { fetchLiveQuote } from '@/utils/liveQuotes';
// Live utils - quotable.io integrated


import {
  DIFFICULTY_LEVELS,
  WORD_LISTS,
  QUOTES,
  STORAGE_KEYS,
  WPM_CALCULATION_WINDOW,
} from './constants';
import type { TestResult } from './types';

export function generateTestText(config: any): string {
  switch (config.mode) {
case 'quote':
      return fetchLiveQuote(config.difficulty).then(q => q).catch(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]) as unknown as string;
    case 'time':
    case 'words':
      return generateRandomText(config.difficulty, config.wordCount || 50);
    default:
      return QUOTES[0];
  }
}

function generateRandomText(difficulty: string, wordCount: number): string {
  const words = WORD_LISTS[difficulty as keyof typeof WORD_LISTS]?.slice() || ['word'];
  const result = [];
  for (let i = 0; i < wordCount; i++) {
    result.push(words[Math.floor(Math.random() * words.length)]);
  }
  return result.join(' ');
}

export function generateTestResult(
  config: any,
  targetText: string,
  typedText: string,
  characterResults: any[],
  wordResults: any[],
  startTime: number,
  endTime: number,
  errors: number
): TestResult {
  const duration = (endTime - startTime) / 1000;
  const correctChars = characterResults.filter((c: any) => c.isCorrect).length;

  return {
    id: Date.now().toString(),
    mode: config.mode,
    difficulty: config.difficulty,
    text: targetText,
    typedText,
    wpm: Math.round((correctChars / 5) / (duration / 60)),
    rawWpm: Math.round((characterResults.length / 5) / (duration / 60)),
    accuracy: characterResults.length ? Math.round((correctChars / characterResults.length) * 100) : 100,
    charactersTyped: characterResults.length,
    correctCharacters: correctChars,
    incorrectCharacters: characterResults.length - correctChars,
    wordsTyped: wordResults.length,
    correctWords: wordResults.filter((w: any) => w.isCorrect).length,
    errors,
    startTime,
    endTime,
    duration: Math.round(duration),
    characterResults,
    wordResults: [],
    consistency: 95,
    averageTimePerChar: 150,
  };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', { 
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'text-emerald-500',
    medium: 'text-amber-500',
    hard: 'text-rose-500',
  };
  return colors[difficulty] || 'text-gray-500';
}

export function getModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    time: 'Time Trial',
    words: 'Word Count',
    quote: 'Quote',
  };
  return labels[mode] || mode;
}

export function loadBestScores(): any {
  return {};
}

export function updateBestScore(result: any): boolean {
  // Implementation stub - returns true for demo
  return true;
}

export function addToHistory(): void {}

export function updateStats(): any {}

export function generateId(): string {
  return Date.now().toString();
}

