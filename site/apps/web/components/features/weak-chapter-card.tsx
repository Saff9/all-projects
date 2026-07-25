'use client';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, TrendingUp, Target } from 'lucide-react';
import Link from 'next/link';

interface WeakChapter {
  id: string;
  name: string;
  subject: string;
  subjectColor: 'physics' | 'chemistry' | 'mathematics' | 'biology';
  accuracy: number;
  attemptedQuestions: number;
  improvement?: number;
}

interface WeakChapterCardProps {
  chapter: WeakChapter;
  className?: string;
}

const colorMap = {
  physics: {
    bg: 'bg-physics/10',
    text: 'text-physics',
    badge: 'physics' as const,
  },
  chemistry: {
    bg: 'bg-chemistry/10',
    text: 'text-chemistry',
    badge: 'chemistry' as const,
  },
  mathematics: {
    bg: 'bg-mathematics/10',
    text: 'text-mathematics',
    badge: 'mathematics' as const,
  },
  biology: {
    bg: 'bg-biology/10',
    text: 'text-biology',
    badge: 'biology' as const,
  },
};

export function WeakChapterCard({ chapter, className }: WeakChapterCardProps) {
  const colors = colorMap[chapter.subjectColor];
  const accuracyLevel =
    chapter.accuracy < 40 ? 'critical' : chapter.accuracy < 60 ? 'needs-work' : 'improving';

  const accuracyColors = {
    critical: 'text-red-500 bg-red-500/10',
    'needs-work': 'text-yellow-500 bg-yellow-500/10',
    improving: 'text-green-500 bg-green-500/10',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={colors.badge} className="text-xs">
                {chapter.subject}
              </Badge>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  accuracyColors[accuracyLevel]
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {accuracyLevel === 'critical'
                  ? 'Critical'
                  : accuracyLevel === 'needs-work'
                  ? 'Needs Work'
                  : 'Improving'}
              </span>
            </div>
            <h4 className="font-medium truncate">{chapter.name}</h4>
            <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {chapter.accuracy}% accuracy
              </span>
              <span>{chapter.attemptedQuestions} questions</span>
            </div>
            {chapter.improvement !== undefined && (
              <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+{chapter.improvement}% improvement this week</span>
              </div>
            )}
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/pyqs?chapter=${chapter.id}` as any}>
              Practice
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// List view for weak chapters
interface WeakChapterListProps {
  chapters: WeakChapter[];
  maxItems?: number;
  className?: string;
  emptyMessage?: string;
}

export function WeakChapterList({
  chapters,
  maxItems = 5,
  className,
  emptyMessage = 'No weak chapters identified. Keep practicing!',
}: WeakChapterListProps) {
  const displayChapters = chapters.slice(0, maxItems);

  if (displayChapters.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayChapters.map((chapter) => (
        <WeakChapterCard key={chapter.id} chapter={chapter} />
      ))}
    </div>
  );
}

// Compact card for sidebar
interface WeakChapterCompactProps {
  chapter: WeakChapter;
  className?: string;
}

export function WeakChapterCompact({ chapter, className }: WeakChapterCompactProps) {
  const colors = colorMap[chapter.subjectColor];

  return (
    <Link
      href={`/pyqs?chapter=${chapter.id}`}
      className={cn(
        'flex items-center justify-between rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={cn('rounded-lg p-1.5', colors.bg)}>
          <AlertTriangle className={cn('h-4 w-4', colors.text)} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{chapter.name}</p>
          <p className="text-xs text-muted-foreground">{chapter.subject}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-red-500">{chapter.accuracy}%</p>
      </div>
    </Link>
  );
}
