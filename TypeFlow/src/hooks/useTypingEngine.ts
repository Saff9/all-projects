'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  TestConfig,
  TypingState,
  TestResult,
  CharacterResult,
  WordResult,
} from '@/lib/types';
import { generateTestText, generateTestResult } from '@/lib/utils';
import { DIFFICULTY_LEVELS } from '@/lib/constants';

type Timer = ReturnType<typeof setTimeout>;

const DEFAULT_CONFIG: TestConfig = {
  mode: 'time',
  difficulty: 'medium',
  timeLimit: 60,
};

const INITIAL_STATE: TypingState = {
  status: 'idle',
  config: DEFAULT_CONFIG,
  targetText: '',
  typedText: '',
  currentIndex: 0,
  characterResults: [],
  wordResults: [],
  startTime: null,
  elapsedTime: 0,
  errors: 0,
  correctChars: 0,
  incorrectChars: 0,
  currentWpm: 0,
  rawWpm: 0,
  accuracy: 100,
  lastKeyTime: 0,
  keyPressTimes: [],
};

export function useTypingEngine() {

  const [state, setState] = useState<TypingState>(INITIAL_STATE);
  const [result, setResult] = useState<TestResult | null>(null);
  const timerRef = useRef<Timer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasStarted = useRef(false);

  const startTimer = useCallback(() => {
    if (hasStarted.current || state.status === 'running') return;
    hasStarted.current = true;

    try {
      const startTime = Date.now();
      setState((prev) => ({
        ...prev,
        status: 'running' as const,
        startTime,
        lastKeyTime: startTime,
      }));

      if (state.config.mode === 'time' && state.config.timeLimit) {
        timerRef.current = setInterval(() => {
          setState((prev) => {
            if (prev.status !== 'running') return prev;
            const elapsed = (Date.now() - (prev.startTime || Date.now())) / 1000;
            if (elapsed >= prev.config.timeLimit!) {
              endTest();
              return prev;
            }
            return { ...prev, elapsedTime: elapsed };
          });
        }, 50);
      } else {
        const tick = () => {
          setState((prev) => {
            if (prev.status !== 'running') return prev;
            const elapsed = (Date.now() - (prev.startTime || Date.now())) / 1000;
            return { ...prev, elapsedTime: elapsed };
          });
          animationFrameRef.current = requestAnimationFrame(tick);
        };
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    } catch (error) {
      console.error('Start timer error:', error);
    }
  }, []);

  const endTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    hasStarted.current = false;
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (key.length !== 1 || !/^[a-zA-Z0-9\s\.\,\!\?\;\:\-\'\"]$/.test(key)) return;

    setState((prev) => {
      if (prev.status === 'completed' || prev.targetText.length === 0) return prev;
      if (prev.currentIndex >= prev.targetText.length) return prev;

      const now = Date.now();
      const expected = prev.targetText[prev.currentIndex];
      const isCorrect = key === expected;
      const timeToType = prev.status === 'running' ? now - prev.lastKeyTime : 0;

      const newCharResult: CharacterResult = {
        character: key,
        expected,
        isCorrect,
        typedAt: now,
        timeToType,
      };

      const newCharResults = [...prev.characterResults, newCharResult];
      const correctChars = newCharResults.filter(c => c.isCorrect).length;
      const elapsed = (now - (prev.startTime || now)) / 1000;
      const currentWpm = elapsed > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
      const rawWpm = elapsed > 0 ? Math.round((newCharResults.length / 5) / (elapsed / 60)) : 0;
      const accuracy = newCharResults.length > 0 ? Math.round((correctChars / newCharResults.length) * 100) : 100;

      // Start on first key
      if (prev.status === 'idle') {
        startTimer();
      }

      let newStatus: TypingState['status'] = prev.status === 'idle' ? 'running' : prev.status;
      let newWordResults = prev.wordResults;

      // Word check
      const nextIdx = prev.currentIndex + 1;
      if (nextIdx >= prev.targetText.length || prev.targetText[nextIdx] === ' ') {
        const wordStart = prev.targetText.lastIndexOf(' ', prev.currentIndex - 1) + 1;
        const expectedWord = prev.targetText.substring(wordStart, nextIdx);
        const typedWordStart = prev.typedText.lastIndexOf(' ', prev.typedText.length - 2) + 1 || 0;
        const typedWord = prev.typedText.substring(typedWordStart) + key;
        const wordCorrect = typedWord.trim() === expectedWord.trim().replace(/[.,!?;:'"]$/, '');
        newWordResults = [...newWordResults, {
          word: typedWord.trim(),
          expected: expectedWord.trim(),
          isCorrect: wordCorrect,
          characters: newCharResults.slice(-expectedWord.length),
          startTime: prev.startTime || now,
          endTime: now,
          wpm: currentWpm,
        }];
      }

      // Check completion
      if ((prev.config.mode === 'words' || prev.config.mode === 'quote') && nextIdx >= prev.targetText.length) {
        newStatus = 'completed';
        endTest();
      }

      return {
        ...prev,
        status: newStatus,
        typedText: prev.typedText + key,
        currentIndex: nextIdx,
        characterResults: newCharResults,
        wordResults: newWordResults,
        correctChars,
        incorrectChars: newCharResults.length - correctChars,
        errors: prev.errors + (isCorrect ? 0 : 1),
        currentWpm,
        rawWpm,
        accuracy,
        lastKeyTime: now,
        keyPressTimes: [...prev.keyPressTimes, now],
        elapsedTime: elapsed,
      };
    });
  }, [startTimer, endTest]);

  const handleBackspace = useCallback(() => {
    setState((prev) => {
      if (prev.status !== 'running' || prev.currentIndex === 0) return prev;
      const newCharResults = prev.characterResults.slice(0, -1);
      const correctChars = newCharResults.filter(c => c.isCorrect).length;
      const elapsed = prev.elapsedTime;
      const currentWpm = elapsed > 0 ? Math.round((correctChars / 5) / (elapsed / 60)) : 0;
      return {
        ...prev,
        typedText: prev.typedText.slice(0, -1),
        currentIndex: prev.currentIndex - 1,
        characterResults: newCharResults,
        correctChars,
        incorrectChars: newCharResults.length - correctChars,
        errors: Math.max(0, prev.errors - 1),
        currentWpm,
        accuracy: newCharResults.length > 0 ? Math.round((correctChars / newCharResults.length) * 100) : 100,
      };
    });
  }, []);

  const initializeTest = useCallback((config: Partial<TestConfig>) => {
    endTest();
    hasStarted.current = false;
    const newConfig = { ...DEFAULT_CONFIG, ...config };
    if (newConfig.mode === 'time' && !newConfig.timeLimit) newConfig.timeLimit = 60;
    if (newConfig.mode === 'words' && !newConfig.wordCount) newConfig.wordCount = DIFFICULTY_LEVELS[newConfig.difficulty as keyof typeof DIFFICULTY_LEVELS].wordCount;
    
    const targetText = generateTestText(newConfig as TestConfig);
    setState({
      ...INITIAL_STATE,
      config: newConfig as TestConfig,
      targetText,
    });
    setResult(null);
  }, [endTest]);

  const completeTest = useCallback(() => {
    endTest();
    const endTime = Date.now();
    const startTime = state.startTime || endTime;
    const testResult = generateTestResult(
      state.config,
      state.targetText,
      state.typedText,
      state.characterResults,
      state.wordResults,
      startTime,
      endTime,
      state.errors
    );
    setResult(testResult);
    setState(prev => ({ ...prev, status: 'completed' as const }));
  }, [state, endTest]);

  const resetTest = useCallback(() => {
    endTest();
    hasStarted.current = false;
    setResult(null);
    setState(INITIAL_STATE);
    initializeTest(state.config);
  }, [endTest, initializeTest, state.config]);

  const updateConfig = useCallback((updates: Partial<TestConfig>) => {
    setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }));
  }, []);

  const getRemainingTime = useCallback(() => {
    if (state.config.mode !== 'time' || !state.config.timeLimit) return 0;
    return Math.max(0, state.config.timeLimit - state.elapsedTime);
  }, [state]);

  const getProgress = useCallback(() => {
    if (state.config.mode === 'time' && state.config.timeLimit) return (state.elapsedTime / state.config.timeLimit) * 100;
    return state.currentIndex / Math.max(state.targetText.length, 1) * 100;
  }, [state]);

  useEffect(() => {
    return endTest;
  }, []);

  useEffect(() => {
    if (state.status === 'running' && state.config.mode === 'time' && state.config.timeLimit && state.elapsedTime >= state.config.timeLimit) {
      completeTest();
    }
  }, [state.elapsedTime, state.status, state.config, completeTest]);

  return {
    state,
    result,
    initializeTest,
    handleKeyPress,
    handleBackspace,
    resetTest,
    updateConfig,
    getRemainingTime,
    getProgress,
  };
}

