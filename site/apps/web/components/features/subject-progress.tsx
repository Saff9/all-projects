'use client';

import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface SubjectProgressProps {
  subject: {
    name: string;
    progress: number;
    chaptersCompleted: number;
    totalChapters: number;
    questionsSolved: number;
    color: 'physics' | 'chemistry' | 'mathematics' | 'biology';
  };
  showDetails?: boolean;
  className?: string;
}

const colorMap = {
  physics: {
    bg: 'bg-physics/10',
    text: 'text-physics',
    progress: '[&>div]:bg-physics',
  },
  chemistry: {
    bg: 'bg-chemistry/10',
    text: 'text-chemistry',
    progress: '[&>div]:bg-chemistry',
  },
  mathematics: {
    bg: 'bg-mathematics/10',
    text: 'text-mathematics',
    progress: '[&>div]:bg-mathematics',
  },
  biology: {
    bg: 'bg-biology/10',
    text: 'text-biology',
    progress: '[&>div]:bg-biology',
  },
};

export function SubjectProgress({
  subject,
  showDetails = true,
  className,
}: SubjectProgressProps) {
  const colors = colorMap[subject.color];

  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('rounded-lg p-2', colors.bg)}>
            <BookOpen className={cn('h-4 w-4', colors.text)} />
          </div>
          <span className="font-medium">{subject.name}</span>
        </div>
        <Badge variant={subject.color as any} className="text-xs">
          {Math.round(subject.progress)}%
        </Badge>
      </div>

      <Progress
        value={subject.progress}
        className={cn('h-2', colors.progress)}
      />

      {showDetails && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {subject.chaptersCompleted}/{subject.totalChapters} chapters
          </span>
          <span>{subject.questionsSolved.toLocaleString()} questions</span>
        </div>
      )}
    </div>
  );
}

// Compact version for sidebar or small spaces
interface SubjectProgressCompactProps {
  subject: {
    name: string;
    progress: number;
    color: 'physics' | 'chemistry' | 'mathematics' | 'biology';
  };
  className?: string;
}

export function SubjectProgressCompact({
  subject,
  className,
}: SubjectProgressCompactProps) {
  const colors = colorMap[subject.color];

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('rounded-lg p-1.5', colors.bg)}>
        <BookOpen className={cn('h-3 w-3', colors.text)} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{subject.name}</span>
          <span className={cn('text-xs font-medium', colors.text)}>
            {Math.round(subject.progress)}%
          </span>
        </div>
        <Progress
          value={subject.progress}
          className={cn('h-1.5', colors.progress)}
        />
      </div>
    </div>
  );
}

// Grid view for all subjects
interface SubjectProgressGridProps {
  subjects: Array<{
    name: string;
    progress: number;
    chaptersCompleted: number;
    totalChapters: number;
    questionsSolved: number;
    color: 'physics' | 'chemistry' | 'mathematics' | 'biology';
  }>;
  className?: string;
}

export function SubjectProgressGrid({
  subjects,
  className,
}: SubjectProgressGridProps) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {subjects.map((subject) => (
        <SubjectProgress key={subject.name} subject={subject} />
      ))}
    </div>
  );
}

// List view for all subjects
interface SubjectProgressListProps {
  subjects: Array<{
    name: string;
    progress: number;
    color: 'physics' | 'chemistry' | 'mathematics' | 'biology';
  }>;
  className?: string;
}

export function SubjectProgressList({
  subjects,
  className,
}: SubjectProgressListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {subjects.map((subject) => (
        <SubjectProgressCompact key={subject.name} subject={subject} />
      ))}
    </div>
  );
}
