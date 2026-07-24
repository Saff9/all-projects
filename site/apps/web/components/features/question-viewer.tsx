'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Bookmark,
  AlertCircle,
  RotateCcw,
  Eye,
  EyeOff,
  HelpCircle,
  Clock,
  Flag,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionViewerProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer?: string | string[];
  isSubmitted?: boolean;
  showSolution?: boolean;
  timer?: number;
  isMarkedForReview?: boolean;
  onAnswer: (answer: string | string[]) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onMarkForReview?: () => void;
  onShowSolution?: () => void;
  onReset?: () => void;
  className?: string;
}

interface Question {
  id: string;
  questionText: string;
  questionImageUrl?: string;
  questionType: 'mcq' | 'multiple_correct' | 'numerical' | 'assertion_reason' | 'matrix_match';
  options?: QuestionOption[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  sourceExam?: string;
  sourceYear?: number;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
}

interface QuestionOption {
  id: string;
  optionLabel: string;
  optionText?: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
}

const difficultyConfig = {
  easy: {
    label: 'Easy',
    color: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  },
  medium: {
    label: 'Medium',
    color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  },
  hard: {
    label: 'Hard',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  },
};

export function QuestionViewer({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  isSubmitted = false,
  showSolution = false,
  timer,
  isMarkedForReview = false,
  onAnswer,
  onNavigate,
  onMarkForReview,
  onShowSolution,
  onReset,
  className,
}: QuestionViewerProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : []
  );
  const [showHint, setShowHint] = useState(false);
  const [internalShowSolution, setInternalShowSolution] = useState(showSolution);

  const difficulty = difficultyConfig[question.difficultyLevel];
  const isCorrect = checkIfCorrect();
  const isMCQ = question.questionType === 'mcq';
  const isMultipleCorrect = question.questionType === 'multiple_correct';
  const isNumerical = question.questionType === 'numerical';

  useEffect(() => {
    setSelectedOptions(
      Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : []
    );
  }, [userAnswer, question.id]);

  function checkIfCorrect(): boolean {
    if (!isSubmitted || !question.options) return false;
    const correctAnswers = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.optionLabel);
    return (
      selectedOptions.length === correctAnswers.length &&
      selectedOptions.every((o) => correctAnswers.includes(o))
    );
  }

  const handleOptionClick = (optionLabel: string) => {
    if (isSubmitted) return;

    if (isMultipleCorrect) {
      const newSelected = selectedOptions.includes(optionLabel)
        ? selectedOptions.filter((o) => o !== optionLabel)
        : [...selectedOptions, optionLabel];
      setSelectedOptions(newSelected);
      onAnswer(newSelected);
    } else if (isMCQ) {
      setSelectedOptions([optionLabel]);
      onAnswer(optionLabel);
    }
  };

  const getOptionStyle = (option: QuestionOption) => {
    const isSelected = selectedOptions.includes(option.optionLabel);

    if (!isSubmitted) {
      return isSelected
        ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
        : 'hover:bg-muted/50';
    }

    if (option.isCorrect) {
      return 'bg-green-500/10 border-green-500 ring-2 ring-green-500/20';
    }
    if (isSelected && !option.isCorrect) {
      return 'bg-red-500/10 border-red-500 ring-2 ring-red-500/20';
    }
    return '';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Badge variant="outline" className={difficulty.color}>
            {difficulty.label}
          </Badge>
          {question.sourceExam && question.sourceYear && (
            <Badge variant="secondary">
              {question.sourceExam} {question.sourceYear}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {timer !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-4 w-4" />
              <span className={cn(timer < 60 && 'text-red-500 font-semibold')}>
                {formatTime(timer)}
              </span>
            </div>
          )}
          {isMarkedForReview && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-500">
              <Flag className="h-3 w-3 mr-1" />
              Marked
            </Badge>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={(questionNumber / totalQuestions) * 100} className="h-1" />

      {/* Question Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg leading-relaxed">
            {question.questionText}
          </CardTitle>
          {question.questionImageUrl && (
            <div className="mt-3">
              <img
                src={question.questionImageUrl}
                alt="Question"
                className="max-w-full rounded-lg border"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {/* Options */}
          {question.options && question.options.length > 0 && (
            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedOptions.includes(option.optionLabel);
                const optionStyle = getOptionStyle(option);

                return (
                  <motion.button
                    key={option.id}
                    whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                    onClick={() => handleOptionClick(option.optionLabel)}
                    disabled={isSubmitted}
                    className={cn(
                      'w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all',
                      optionStyle
                    )}
                  >
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 font-semibold text-sm',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30'
                      )}
                    >
                      {option.optionLabel}
                    </div>
                    <div className="flex-1">
                      {option.optionText && (
                        <p className="text-sm leading-relaxed">{option.optionText}</p>
                      )}
                      {option.optionImageUrl && (
                        <img
                          src={option.optionImageUrl}
                          alt={`Option ${option.optionLabel}`}
                          className="max-w-full rounded mt-2"
                        />
                      )}
                      {(internalShowSolution || showSolution) && option.explanation && (
                        <p className="text-xs text-muted-foreground mt-2 italic">
                          {option.explanation}
                        </p>
                      )}
                    </div>
                    {isSubmitted && option.isCorrect && (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    )}
                    {isSubmitted && isSelected && !option.isCorrect && (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Numerical Input */}
          {isNumerical && (
            <div className="mt-4">
              <input
                type="text"
                value={Array.isArray(userAnswer) ? userAnswer[0] || '' : userAnswer || ''}
                onChange={(e) => onAnswer(e.target.value)}
                disabled={isSubmitted}
                placeholder="Enter your answer"
                className="w-full p-4 rounded-lg border text-lg font-mono"
              />
            </div>
          )}

          {/* Hint Section */}
          {question.hint && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-yellow-600"
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {question.hint}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Result Section */}
          {isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'mt-4 p-4 rounded-lg',
                isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      Correct!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      Incorrect
                    </span>
                  </>
                )}
              </div>
              {!isCorrect && question.options && (
                <p className="text-sm text-muted-foreground">
                  Correct answer:{' '}
                  <span className="font-semibold text-green-600">
                    {question.options
                      .filter((o) => o.isCorrect)
                      .map((o) => o.optionLabel)
                      .join(', ')}
                  </span>
                </p>
              )}
            </motion.div>
          )}

          {/* Solution Section */}
          {question.solutionText && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onShowSolution) {
                    onShowSolution();
                  }
                  setInternalShowSolution(!internalShowSolution);
                }}
              >
                {internalShowSolution || showSolution ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Hide Solution
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Show Solution
                  </>
                )}
              </Button>
              <AnimatePresence>
                {(internalShowSolution || showSolution) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-600 dark:text-green-400">
                          Solution
                        </span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                        {question.solutionText}
                      </p>
                      {question.solutionImageUrl && (
                        <img
                          src={question.solutionImageUrl}
                          alt="Solution"
                          className="max-w-full rounded-lg mt-2 border"
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {!isSubmitted && onReset && (
                <Button variant="ghost" size="sm" onClick={onReset}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Reset
                </Button>
              )}
              {onMarkForReview && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkForReview}
                  className={cn(isMarkedForReview && 'text-yellow-600 border-yellow-500')}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {isMarkedForReview ? 'Unmark' : 'Mark for Review'}
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onNavigate('prev')}
                disabled={questionNumber === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={() => onNavigate('next')}
                disabled={questionNumber === totalQuestions}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Question Navigation Panel
export interface QuestionNavPanelProps {
  questions: { id: string; isAnswered?: boolean; isMarked?: boolean; isCorrect?: boolean }[];
  currentQuestion: number;
  onNavigate: (index: number) => void;
  showResults?: boolean;
  className?: string;
}

export function QuestionNavPanel({
  questions,
  currentQuestion,
  onNavigate,
  showResults = false,
  className,
}: QuestionNavPanelProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Question Navigator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => {
            const isCurrent = currentQuestion === index + 1;
            return (
              <button
                key={q.id}
                onClick={() => onNavigate(index)}
                className={cn(
                  'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                  'flex items-center justify-center',
                  isCurrent && 'ring-2 ring-primary ring-offset-2',
                  showResults
                    ? q.isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : q.isMarked
                    ? 'bg-yellow-500 text-white'
                    : q.isAnswered
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
        {!showResults && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-primary" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-yellow-500" />
              <span>Marked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-muted" />
              <span>Not Answered</span>
            </div>
          </div>
        )}
        {showResults && (
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-500" />
              <span>Correct</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-red-500" />
              <span>Incorrect</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default QuestionViewer;