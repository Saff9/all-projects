'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
  ExternalLink,
  Copy,
  Share2,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface PYQCardProps {
  id: string;
  questionText: string;
  questionImageUrl?: string;
  questionType: 'mcq' | 'multiple_correct' | 'numerical' | 'assertion_reason' | 'matrix_match';
  options?: QuestionOption[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  sourceExam: string;
  sourceYear: number;
  subjectId?: string;
  subjectName?: string;
  chapterId?: string;
  chapterName?: string;
  topicId?: string;
  topicName?: string;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
  isSolved?: boolean;
  isMarked?: boolean;
  userAnswer?: string[];
  isExpanded?: boolean;
  showSolution?: boolean;
  onBookmark?: (id: string) => void;
  onAddToMistakes?: (id: string) => void;
  onToggleExpand?: (id: string) => void;
  className?: string;
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

const examColors: Record<string, string> = {
  NEET: 'bg-biology text-white',
  JEE_MAIN: 'bg-physics text-white',
  JEE_ADVANCED: 'bg-mathematics text-white',
};

export function PYQCard({
  id,
  questionText,
  questionImageUrl,
  questionType,
  options = [],
  difficultyLevel,
  sourceExam,
  sourceYear,
  subjectName,
  chapterName,
  topicName,
  solutionText,
  solutionImageUrl,
  hint,
  isSolved = false,
  isMarked = false,
  userAnswer = [],
  isExpanded: externalExpanded,
  showSolution: externalShowSolution,
  onBookmark,
  onAddToMistakes,
  onToggleExpand,
  className,
}: PYQCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [internalShowSolution, setInternalShowSolution] = useState(false);
  const [copied, setCopied] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isExpanded = externalExpanded ?? internalExpanded;
  const showSolution = externalShowSolution ?? internalShowSolution;

  const difficulty = difficultyConfig[difficultyLevel];

  const handleCopy = async () => {
    const text = `${questionText}\n\n${options
      .map((o) => `${o.optionLabel}. ${o.optionText}`)
      .join('\n')}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getOptionStyle = (option: QuestionOption) => {
    if (!showSolution) return '';
    if (option.isCorrect) return 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-400';
    if (userAnswer.includes(option.optionLabel)) {
      return 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-400';
    }
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300 hover:shadow-md',
          isSolved && 'border-green-500/30',
          isMarked && 'border-yellow-500/30'
        )}
      >
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {/* Exam Badge */}
              <Badge className={examColors[sourceExam] || 'bg-primary'}>
                {sourceExam} {sourceYear}
              </Badge>
              {/* Difficulty Badge */}
              <Badge variant="outline" className={difficulty.color}>
                {difficulty.label}
              </Badge>
              {/* Question Type */}
              {questionType !== 'mcq' && (
                <Badge variant="outline" className="capitalize">
                  {questionType.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* Status Indicators */}
              {isSolved && (
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
              {isMarked && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Bookmark className="h-4 w-4 fill-current" />
                </div>
              )}
            </div>
          </div>

          {/* Subject/Chapter Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            <Badge variant="secondary" className="text-xs">
              {subjectName}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {chapterName}
            </Badge>
            {topicName && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {topicName}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Question Content */}
        <CardContent className="pt-0">
          {/* Question Text */}
          <div className="mb-4">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {questionText}
            </p>
            {questionImageUrl && (
              <div className="mt-3">
                <img
                  src={questionImageUrl}
                  alt="Question"
                  className="max-w-full rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Options */}
          {options.length > 0 && (
            <div className="space-y-2 mb-4">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg border transition-all',
                    'hover:bg-muted/50 cursor-pointer',
                    getOptionStyle(option)
                  )}
                >
                  <span className="font-semibold text-sm shrink-0">
                    {option.optionLabel}.
                  </span>
                  <div className="flex-1">
                    {option.optionText && (
                      <p className="text-sm">{option.optionText}</p>
                    )}
                    {option.optionImageUrl && (
                      <img
                        src={option.optionImageUrl}
                        alt={`Option ${option.optionLabel}`}
                        className="max-w-full rounded mt-1"
                      />
                    )}
                    {showSolution && option.explanation && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {option.explanation}
                      </p>
                    )}
                  </div>
                  {showSolution && option.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => {
              if (onToggleExpand) {
                onToggleExpand(id);
              } else {
                setInternalExpanded(!internalExpanded);
              }
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1 mb-3"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Solution & More
              </>
            )}
          </button>

          {/* Expanded Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-3 border-t space-y-4">
                  {/* Hint */}
                  {hint && (
                    <div className="bg-yellow-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 mb-1">
                        <Lightbulb className="h-4 w-4" />
                        <span className="font-medium text-sm">Hint</span>
                      </div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {hint}
                      </p>
                    </div>
                  )}

                  {/* Show Solution Button */}
                  {!showSolution && solutionText && (
                    <Button
                      variant="outline"
                      onClick={() => setInternalShowSolution(true)}
                      className="w-full"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Show Solution
                    </Button>
                  )}

                  {/* Solution */}
                  {showSolution && solutionText && (
                    <div className="bg-green-500/10 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium text-sm">Solution</span>
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                        {solutionText}
                      </p>
                      {solutionImageUrl && (
                        <img
                          src={solutionImageUrl}
                          alt="Solution"
                          className="max-w-full rounded-lg mt-2 border"
                        />
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onBookmark?.(id)}
                    >
                      <Bookmark
                        className={cn(
                          'h-4 w-4 mr-1',
                          isMarked && 'fill-current text-yellow-500'
                        )}
                      />
                      {isMarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddToMistakes?.(id)}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Add to Mistakes
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/pyqs/practice/${id}` as any}>
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Practice
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton for loading state
export function PYQCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex gap-2 mb-2">
          <div className="h-6 w-24 bg-muted animate-pulse rounded" />
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-1">
          <div className="h-5 w-20 bg-muted animate-pulse rounded" />
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="h-4 w-full bg-muted animate-pulse rounded" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for lists
export function PYQCardCompact({
  id,
  questionText,
  difficultyLevel,
  sourceExam,
  sourceYear,
  subjectName,
  isSolved,
  isMarked,
  onClick,
  className,
}: Pick<
  PYQCardProps,
  'id' | 'questionText' | 'difficultyLevel' | 'sourceExam' | 'sourceYear' | 'subjectName' | 'isSolved' | 'isMarked'
> & { onClick?: () => void; className?: string }) {
  const difficulty = difficultyConfig[difficultyLevel];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border bg-card cursor-pointer transition-colors hover:bg-muted/50',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge className={examColors[sourceExam] || 'bg-primary'} variant="secondary">
            {sourceExam} {sourceYear}
          </Badge>
          <Badge variant="outline" className={difficulty.color}>
            {difficulty.label}
          </Badge>
        </div>
        <p className="text-sm line-clamp-2">{questionText}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isSolved && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        {isMarked && <Bookmark className="h-4 w-4 text-yellow-500 fill-current" />}
      </div>
    </motion.div>
  );
}

export default PYQCard;