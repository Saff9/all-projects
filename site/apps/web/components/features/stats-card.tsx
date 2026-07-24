'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  className,
  iconClassName,
}: StatsCardProps) {
  const changeColors = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            'rounded-lg p-2 bg-primary/10',
            iconClassName
          )}
        >
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(change || description) && (
          <div className="flex items-center gap-1 mt-1">
            {change && (
              <span
                className={cn(
                  'text-xs flex items-center gap-0.5',
                  changeColors[changeType]
                )}
              >
                {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                {change}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">{description}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Mini Stats Card for compact displays
interface MiniStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
}

export function MiniStatsCard({
  title,
  value,
  icon: Icon,
  className,
}: MiniStatsCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-4',
        className
      )}
    >
      <div className="rounded-lg p-2 bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
