'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Bookmark,
  FileText,
  Home,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { QuestionViewer, QuestionNavPanel } from './question-viewer';

export interface PracticeInterfaceProps {
  questions: PracticeQuestion[];
  title?: string;
  examType?: string;
  subjectName?: string;
  chapterName?: string;
  showTimer?: boolean;
  durationMinutes?: number;
  onSubmit: (answers: PracticeAnswer[]) => void;
  onExit?: () => void;
  className?: string;
}

export interface PracticeQuestion {
  id: string;
  questionText: string;
  questionImageUrl?: string;
  questionType: 'mcq' | 'multiple_correct' | 'numerical' | 'assertion_reason' | 'matrix_match';
  options?: PracticeOption[];
  difficultyLevel: 'easy' | 'medium' | 'hard';
  sourceExam?: string;
  sourceYear?: number;
  solutionText?: string;
  solutionImageUrl?: string;
  hint?: string;
}

interface PracticeOption {
  id: string;
  optionLabel: string;
  optionText?: string;
  optionImageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface PracticeAnswer {
  questionId: string;
  answer: string | string[];
  isMarked: boolean;
}

interface PracticeResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeTaken: number;
  accuracy: number;
}

type PracticeMode = 'instructions' | 'practice' | 'results';

export function PracticeInterface({
  questions,
  title = 'Practice Session',
  examType,
  subjectName,
  chapterName,
  showTimer = true,
  durationMinutes,
  onSubmit,
  onExit,
  className,
}: PracticeInterfaceProps) {
  const [mode, setMode] = useState<PracticeMode>('instructions');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, { answer: string | string[]; isMarked: boolean }>>(
    new Map()
  );
  const [timer, setTimer] = useState(durationMinutes ? durationMinutes * 60 : 0);
  const [isPaused, setIsPaused] = useState(false);
  const [result, setResult] = useState<PracticeResult | null>(null);
  const [showAllSolutions, setShowAllSolutions] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion?.id);

  // Timer effect
  useEffect(() => {
    if (mode !== 'practice' || !showTimer || isPaused || !durationMinutes) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, showTimer, isPaused, durationMinutes]);

  const handleAnswer = useCallback(
    (answer: string | string[]) => {
      setAnswers((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(currentQuestion.id) || { answer: '', isMarked: false };
        newMap.set(currentQuestion.id, { ...existing, answer });
        return newMap;
      });
    },
    [currentQuestion?.id]
  );

  const handleMarkForReview = useCallback(() => {
    setAnswers((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(currentQuestion.id) || { answer: '', isMarked: false };
      newMap.set(currentQuestion.id, { ...existing, isMarked: !existing.isMarked });
      return newMap;
    });
  }, [currentQuestion?.id]);

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (direction === 'prev' && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (direction === 'next' && currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    },
    [currentIndex, questions.length]
  );

  const handleJumpToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleSubmit = useCallback(() => {
    const answersArray: PracticeAnswer[] = Array.from(answers.entries()).map(
      ([questionId, data]) => ({
        questionId,
        answer: data.answer,
        isMarked: data.isMarked,
      })
    );

    // Calculate results
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    questions.forEach((q) => {
      const answer = answers.get(q.id);
      if (!answer || !answer.answer || (Array.isArray(answer.answer) && answer.answer.length === 0)) {
        skipped++;
      } else {
        const correctOptions = q.options
          ?.filter((o) => o.isCorrect)
          .map((o) => o.optionLabel) || [];
        const userAnswers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];

        const isCorrect =
          userAnswers.length === correctOptions.length &&
          userAnswers.every((a) => correctOptions.includes(a));

        if (isCorrect) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const practiceResult: PracticeResult = {
      totalQuestions: questions.length,
      attempted: correct + incorrect,
      correct,
      incorrect,
      skipped,
      timeTaken: durationMinutes ? durationMinutes * 60 - timer : 0,
      accuracy: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };

    setResult(practiceResult);
    setMode('results');
    onSubmit(answersArray);
  }, [answers, questions, durationMinutes, timer, onSubmit]);

  const handleRestart = useCallback(() => {
    setMode('instructions');
    setCurrentIndex(0);
    setAnswers(new Map());
    setTimer(durationMinutes ? durationMinutes * 60 : 0);
    setResult(null);
    setShowAllSolutions(false);
  }, [durationMinutes]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Instructions Screen
  if (mode === 'instructions') {
    return (
      <div className={cn('max-w-2xl mx-auto', className)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{title}</CardTitle>
            {examType && (
              <Badge variant="secondary" className="w-fit mt-2">
                {examType}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold">{questions.length}</p>
                <p className="text-sm text-muted-foreground">Questions</p>
              </div>
              {durationMinutes && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold">{durationMinutes}</p>
                  <p className="text-sm text-muted-foreground">Minutes</p>
                </div>
              )}
              {subjectName && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold">{subjectName}</p>
                  <p className="text-sm text-muted-foreground">Subject</p>
                </div>
              )}
              {chapterName && (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-lg font-bold truncate">{chapterName}</p>
                  <p className="text-sm text-muted-foreground">Chapter</p>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-3">
              <h3 className="font-semibold">Instructions</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  Read each question carefully before answering
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                  Click on an option to select your answer
                </li>
                <li className="flex items-start gap-2">
                  <Flag className="h-4 w-4 mt-0.5 text-yellow-500" />
                  Mark questions for review to revisit them later
                </li>
                {showTimer && durationMinutes && (
                  <li className="flex items-start gap-2">
                    <Clock className="h-4 w-4 mt-0.5 text-blue-500" />
                    Complete the test within the time limit
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-red-500" />
                  You cannot change answers after submission
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button size="lg" onClick={() => setMode('practice')} className="flex-1">
                <Play className="h-5 w-5 mr-2" />
                Start Practice
              </Button>
              {onExit && (
                <Button size="lg" variant="outline" onClick={onExit}>
                  Exit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Results Screen
  if (mode === 'results' && result) {
    return (
      <div className={cn('max-w-4xl mx-auto', className)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Result Summary */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-full bg-primary/20">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Practice Complete!</h2>
                  <p className="text-muted-foreground">{title}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-green-500">{result.correct}</p>
                  <p className="text-sm text-muted-foreground">Correct</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-500">{result.incorrect}</p>
                  <p className="text-sm text-muted-foreground">Incorrect</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-500">{result.skipped}</p>
                  <p className="text-sm text-muted-foreground">Skipped</p>
                </div>
                <div className="bg-background/50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{result.accuracy}%</p>
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                </div>
                {durationMinutes && (
                  <div className="bg-background/50 rounded-lg p-4 text-center">
                    <p className="text-3xl font-bold">{formatTime(result.timeTaken)}</p>
                    <p className="text-sm text-muted-foreground">Time</p>
                  </div>
                )}
              </div>
            </div>

            <CardContent className="pt-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Performance</span>
                  <span>{result.accuracy}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.correct / result.totalQuestions) * 100}%` }}
                    className="bg-green-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(result.incorrect / result.totalQuestions) * 100}%` }}
                    className="bg-red-500"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setShowAllSolutions(!showAllSolutions)}>
                  <FileText className="h-4 w-4 mr-2" />
                  {showAllSolutions ? 'Hide Solutions' : 'View All Solutions'}
                </Button>
                <Button variant="outline" onClick={handleRestart}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Practice Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/pyqs">
                    <Home className="h-4 w-4 mr-2" />
                    Back to PYQs
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Question Review */}
          {showAllSolutions && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Question Review</h3>
              {questions.map((question, index) => {
                const answer = answers.get(question.id);
                const userAnswer = answer?.answer || '';
                const correctOptions =
                  question.options
                    ?.filter((o) => o.isCorrect)
                    .map((o) => o.optionLabel) || [];
                const userAnswers = Array.isArray(userAnswer) ? userAnswer : userAnswer ? [userAnswer] : [];
                const isCorrect =
                  userAnswers.length === correctOptions.length &&
                  userAnswers.every((a) => correctOptions.includes(a));

                return (
                  <QuestionViewer
                    key={question.id}
                    question={question}
                    questionNumber={index + 1}
                    totalQuestions={questions.length}
                    userAnswer={userAnswer}
                    isSubmitted={true}
                    showSolution={true}
                    onAnswer={() => {}}
                    onNavigate={() => {}}
                  />
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Practice Mode
  return (
    <div className={cn('', className)}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b py-3">
        <div className="container flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-semibold truncate">{title}</h1>
            {examType && <Badge variant="secondary">{examType}</Badge>}
          </div>
          <div className="flex items-center gap-4">
            {showTimer && durationMinutes && (
              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                  timer < 60 ? 'bg-red-500/10 text-red-500' : 'bg-muted'
                )}
              >
                <Clock className="h-4 w-4" />
                <span className="font-mono font-semibold">{formatTime(timer)}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              )}
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-6">
        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Question Area */}
          <div>
            {isPaused ? (
              <Card className="p-12 text-center">
                <Pause className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-xl font-semibold mb-2">Practice Paused</h2>
                <p className="text-muted-foreground mb-4">
                  Click Resume to continue your practice session
                </p>
                <Button onClick={() => setIsPaused(false)}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume Practice
                </Button>
              </Card>
            ) : (
              <QuestionViewer
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questions.length}
                userAnswer={currentAnswer?.answer}
                isMarkedForReview={currentAnswer?.isMarked}
                onAnswer={handleAnswer}
                onNavigate={handleNavigate}
                onMarkForReview={handleMarkForReview}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <QuestionNavPanel
              questions={questions.map((q) => ({
                id: q.id,
                isAnswered: !!(answers.get(q.id)?.answer),
                isMarked: answers.get(q.id)?.isMarked || false,
              }))}
              currentQuestion={currentIndex + 1}
              onNavigate={handleJumpToQuestion}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeInterface;