'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Clock,
  Target,
  Play,
  CheckCircle2,
  Circle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface ChapterCardProps {
  id: string;
  name: string;
  slug: string;
  chapterNumber?: number;
  subjectId: string;
  subjectName: string;
  subjectSlug: string;
  examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
  weightage?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
  totalTopics: number;
  totalQuestions: number;
  estimatedHours?: number;
  status?: 'not_started' | 'in_progress' | 'completed' | 'revision';
  completionPercentage?: number;
  topics?: Topic[];
  ncertLink?: string;
  isWeakChapter?: boolean;
  className?: string;
}

interface Topic {
  id: string;
  name: string;
  topicNumber?: number;
  difficultyLevel?: 'easy' | 'medium' | 'hard';
}

const difficultyColors = {
  easy: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  hard: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
};

const statusConfig = {
  not_started: {
    label: 'Not Started',
    icon: Circle,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
  },
  in_progress: {
    label: 'In Progress',
    icon: AlertCircle,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  revision: {
    label: 'Revision',
    icon: Target,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
};

export function ChapterCard({
  id,
  name,
  slug,
  chapterNumber,
  subjectId,
  subjectName,
  subjectSlug,
  examType,
  weightage,
  difficultyLevel,
  totalTopics,
  totalQuestions,
  estimatedHours,
  status = 'not_started',
  completionPercentage = 0,
  topics = [],
  ncertLink,
  isWeakChapter = false,
  className,
}: ChapterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const getWeightageColor = (weightage?: number) => {
    if (!weightage) return 'text-muted-foreground';
    if (weightage >= 8) return 'text-red-500 font-semibold';
    if (weightage >= 5) return 'text-orange-500';
    return 'text-muted-foreground';
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
          isWeakChapter && 'border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/10',
          status === 'completed' && 'border-green-500/30',
          status === 'in_progress' && 'border-blue-500/30'
        )}
      >
        {/* Chapter Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {chapterNumber && (
                  <Badge variant="outline" className="text-xs">
                    Ch {chapterNumber}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs capitalize',
                    difficultyLevel && difficultyColors[difficultyLevel]
                  )}
                >
                  {difficultyLevel || 'Medium'}
                </Badge>
                {isWeakChapter && (
                  <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                    Weak
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight line-clamp-2">
                <Link
                  href={`/${examType.toLowerCase().replace('_', '-')}/${subjectSlug}/${slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {name}
                </Link>
              </CardTitle>
            </div>
            <div className="flex flex-col items-end gap-2">
              {weightage !== undefined && (
                <div className={cn('text-sm', getWeightageColor(weightage))}>
                  {weightage}% weightage
                </div>
              )}
              <div className={cn('flex items-center gap-1 text-xs', statusInfo.color)}>
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Progress Bar */}
          {status !== 'not_started' && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{totalTopics} topics</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>{totalQuestions} PYQs</span>
            </div>
            {estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{estimatedHours}h</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Button size="sm" asChild className="flex-1 min-w-[120px]">
              <Link href={`/${examType.toLowerCase().replace('_', '-')}/${subjectSlug}/${slug}`}>
                {status === 'not_started' ? (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Start Learning
                  </>
                ) : status === 'completed' ? (
                  <>
                    <Target className="h-4 w-4 mr-1" />
                    Revise
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-1" />
                    Continue
                  </>
                )}
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/pyqs?chapter=${id}&exam=${examType}`}>
                <FileText className="h-4 w-4 mr-1" />
                PYQs
              </Link>
            </Button>
            {ncertLink && (
              <Button size="sm" variant="ghost" asChild>
                <a href={ncertLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  NCERT
                </a>
              </Button>
            )}
          </div>

          {/* Expand/Collapse Topics */}
          {topics.length > 0 && (
            <>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Topics
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show {topics.length} Topics
                  </>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t">
                      <ul className="space-y-2">
                        {topics.map((topic, index) => (
                          <li
                            key={topic.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {topic.topicNumber || index + 1}.
                              </span>
                              <span className="line-clamp-1">{topic.name}</span>
                            </div>
                            {topic.difficultyLevel && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-xs capitalize',
                                  difficultyColors[topic.difficultyLevel]
                                )}
                              >
                                {topic.difficultyLevel}
                              </Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Skeleton for loading state
export function ChapterCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex gap-2 mb-2">
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-4 mb-4">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default ChapterCard;