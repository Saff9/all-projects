'use client';

import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'physics' | 'chemistry' | 'mathematics' | 'biology';
}

const colorMap = {
  primary: 'text-primary',
  physics: 'text-physics',
  chemistry: 'text-chemistry',
  mathematics: 'text-mathematics',
  biology: 'text-biology',
};

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  className,
  showLabel = true,
  label,
  color = 'primary',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className={cn(
            'transition-all duration-500 ease-out',
            colorMap[color]
          )}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold">{Math.round(progress)}%</span>
          {label && (
            <span className="text-xs text-muted-foreground text-center max-w-[80px]">
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Multiple Progress Ring for comparing subjects
interface SubjectProgressRingProps {
  subjects: Array<{
    name: string;
    progress: number;
    color: 'physics' | 'chemistry' | 'mathematics' | 'biology';
  }>;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function SubjectProgressRing({
  subjects,
  size = 120,
  strokeWidth = 10,
  className,
}: SubjectProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  return (
    <div className={cn('flex items-center gap-6', className)}>
      {subjects.map((subject) => {
        const offset = circumference - (subject.progress / 100) * circumference;
        return (
          <div key={subject.name} className="flex flex-col items-center gap-2">
            <div className="relative">
              <svg
                className="transform -rotate-90"
                width={size}
                height={size}
              >
                <circle
                  className="text-muted"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx={size / 2}
                  cy={size / 2}
                />
                <circle
                  className={cn(
                    'transition-all duration-500 ease-out',
                    colorMap[subject.color]
                  )}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx={size / 2}
                  cy={size / 2}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: offset,
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold">{Math.round(subject.progress)}%</span>
              </div>
            </div>
            <span className="text-sm text-muted-foreground">{subject.name}</span>
          </div>
        );
      })}
    </div>
  );
}
