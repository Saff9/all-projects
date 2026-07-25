'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, FlaskConical, Atom, Calculator, Dna, Leaf, Microscope } from 'lucide-react';

export interface SubjectTab {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  hoverColor: string;
  totalChapters: number;
  completedChapters?: number;
  totalQuestions?: number;
}

export interface SubjectTabsProps {
  subjects: SubjectTab[];
  activeSubject: string;
  onSubjectChange: (subjectId: string) => void;
  showProgress?: boolean;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Default subject configurations
export const neetSubjects: SubjectTab[] = [
  {
    id: 'physics',
    name: 'Physics',
    slug: 'physics',
    icon: Atom,
    color: 'text-physics',
    bgColor: 'bg-physics',
    hoverColor: 'hover:bg-physics/10',
    totalChapters: 29,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    slug: 'chemistry',
    icon: FlaskConical,
    color: 'text-chemistry',
    bgColor: 'bg-chemistry',
    hoverColor: 'hover:bg-chemistry/10',
    totalChapters: 30,
  },
  {
    id: 'biology',
    name: 'Biology',
    slug: 'biology',
    icon: Dna,
    color: 'text-biology',
    bgColor: 'bg-biology',
    hoverColor: 'hover:bg-biology/10',
    totalChapters: 38,
  },
];

export const jeeSubjects: SubjectTab[] = [
  {
    id: 'physics',
    name: 'Physics',
    slug: 'physics',
    icon: Atom,
    color: 'text-physics',
    bgColor: 'bg-physics',
    hoverColor: 'hover:bg-physics/10',
    totalChapters: 20,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    slug: 'chemistry',
    icon: FlaskConical,
    color: 'text-chemistry',
    bgColor: 'bg-chemistry',
    hoverColor: 'hover:bg-chemistry/10',
    totalChapters: 25,
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    slug: 'mathematics',
    icon: Calculator,
    color: 'text-mathematics',
    bgColor: 'bg-mathematics',
    hoverColor: 'hover:bg-mathematics/10',
    totalChapters: 18,
  },
];

const sizeClasses = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

export function SubjectTabs({
  subjects,
  activeSubject,
  onSubjectChange,
  showProgress = false,
  variant = 'default',
  size = 'md',
  className,
}: SubjectTabsProps) {
  const [hoveredSubject, setHoveredSubject] = useState<string | null>(null);

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Tabs */}
      <div className="hidden sm:flex items-center justify-center gap-2">
        {subjects.map((subject) => {
          const isActive = activeSubject === subject.id;
          const Icon = subject.icon;
          const progressPercentage = showProgress
            ? ((subject.completedChapters || 0) / subject.totalChapters) * 100
            : 0;

          return (
            <button
              key={subject.id}
              onClick={() => onSubjectChange(subject.id)}
              onMouseEnter={() => setHoveredSubject(subject.id)}
              onMouseLeave={() => setHoveredSubject(null)}
              className={cn(
                'relative flex items-center gap-2 rounded-lg font-medium transition-all duration-200',
                sizeClasses[size],
                variant === 'default' && [
                  isActive
                    ? `${subject.bgColor} text-white shadow-md`
                    : `bg-muted/50 ${subject.hoverColor} ${subject.color}`,
                ],
                variant === 'pills' && [
                  isActive
                    ? `${subject.bgColor} text-white`
                    : `bg-transparent ${subject.hoverColor} ${subject.color}`,
                  'rounded-full',
                ],
                variant === 'underline' && [
                  'rounded-none bg-transparent border-b-2',
                  isActive
                    ? `${subject.color} border-current`
                    : 'text-muted-foreground border-transparent hover:border-muted-foreground/50',
                ]
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{subject.name}</span>

              {/* Chapter count badge */}
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {subject.totalChapters}
              </span>

              {/* Progress indicator */}
              {showProgress && subject.completedChapters !== undefined && (
                <span
                  className={cn(
                    'text-xs',
                    isActive ? 'text-white/80' : 'text-muted-foreground'
                  )}
                >
                  {subject.completedChapters}/{subject.totalChapters}
                </span>
              )}

              {/* Hover/Active indicator for underline variant */}
              {variant === 'underline' && (isActive || hoveredSubject === subject.id) && (
                <motion.div
                  layoutId="underline-indicator"
                  className={cn('absolute bottom-0 left-0 right-0 h-0.5', subject.bgColor)}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
          {subjects.map((subject) => {
            const isActive = activeSubject === subject.id;
            const Icon = subject.icon;

            return (
              <button
                key={subject.id}
                onClick={() => onSubjectChange(subject.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 whitespace-nowrap transition-all',
                  isActive
                    ? `${subject.bgColor} text-white`
                    : `bg-muted/50 ${subject.hoverColor} ${subject.color}`
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{subject.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress bars for each subject (optional) */}
      {showProgress && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const progressPercentage =
              ((subject.completedChapters || 0) / subject.totalChapters) * 100;

            return (
              <div key={subject.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={subject.color}>{subject.name}</span>
                  <span className="text-muted-foreground">
                    {subject.completedChapters || 0}/{subject.totalChapters}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', subject.bgColor)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Subject Tab Skeleton
export function SubjectTabsSkeleton() {
  return (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-10 w-32 bg-muted animate-pulse rounded-lg"
        />
      ))}
    </div>
  );
}

// Subject Header Component
export interface SubjectHeaderProps {
  subject: SubjectTab;
  examType: 'NEET' | 'JEE_MAIN' | 'JEE_ADVANCED';
  totalChapters: number;
  completedChapters?: number;
  totalQuestions?: number;
  className?: string;
}

export function SubjectHeader({
  subject,
  examType,
  totalChapters,
  completedChapters = 0,
  totalQuestions = 0,
  className,
}: SubjectHeaderProps) {
  const Icon = subject.icon;
  const progressPercentage = (completedChapters / totalChapters) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-4">
        <div className={cn('p-4 rounded-xl', subject.bgColor, 'bg-opacity-10')}>
          <Icon className={cn('h-8 w-8', subject.color)} />
        </div>
        <div className="flex-1">
          <h2 className={cn('text-2xl font-bold', subject.color)}>
            {subject.name}
          </h2>
          <p className="text-muted-foreground">
            {examType === 'NEET' ? 'NEET' : 'JEE'} Syllabus
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Chapters</p>
          <p className="text-xl font-semibold">
            {completedChapters}/{totalChapters}
          </p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">Progress</p>
          <p className="text-xl font-semibold">{Math.round(progressPercentage)}%</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground">PYQs</p>
          <p className="text-xl font-semibold">{totalQuestions.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className={subject.color}>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={cn('h-full rounded-full', subject.bgColor)}
          />
        </div>
      </div>
    </div>
  );
}

export default SubjectTabs;