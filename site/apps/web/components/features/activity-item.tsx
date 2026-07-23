'use client';

import { cn } from '@/lib/utils';
import { Timer, BookOpen, FileText, Trophy, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';

type ActivityType = 'test' | 'practice' | 'chapter' | 'achievement';

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  description?: string;
  score?: string;
  time: string;
  href?: Route<string> | string;
  status?: 'success' | 'failure' | 'neutral';
  className?: string;
}

const typeConfig = {
  test: {
    icon: Timer,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  practice: {
    icon: FileText,
    bgColor: 'bg-chemistry/10',
    iconColor: 'text-chemistry',
  },
  chapter: {
    icon: BookOpen,
    bgColor: 'bg-mathematics/10',
    iconColor: 'text-mathematics',
  },
  achievement: {
    icon: Trophy,
    bgColor: 'bg-biology/10',
    iconColor: 'text-biology',
  },
};

export function ActivityItem({
  type,
  title,
  description,
  score,
  time,
  href,
  status = 'neutral',
  className,
}: ActivityItemProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  const statusIcons = {
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    failure: <XCircle className="h-4 w-4 text-red-500" />,
    neutral: null,
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-4 rounded-lg border bg-card p-4 transition-all hover:shadow-sm',
        href && 'cursor-pointer hover:border-primary/50',
        className
      )}
    >
      <div className={cn('rounded-lg p-2.5', config.bgColor)}>
        <Icon className={cn('h-5 w-5', config.iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{title}</p>
          {statusIcons[status]}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        {score && <p className="font-semibold">{score}</p>}
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  );

  if (href) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Link href={href as any}>{content}</Link>;
  }

  return content;
}

// Activity list component
interface ActivityListProps {
  activities: Array<{
    type: ActivityType;
    title: string;
    description?: string;
    score?: string;
    time: string;
    href?: string;
    status?: 'success' | 'failure' | 'neutral';
  }>;
  maxItems?: number;
  className?: string;
  emptyMessage?: string;
}

export function ActivityList({
  activities,
  maxItems,
  className,
  emptyMessage = 'No recent activity',
}: ActivityListProps) {
  const displayActivities = maxItems
    ? activities.slice(0, maxItems)
    : activities;

  if (displayActivities.length === 0) {
    return (
      <div className={cn('text-center py-8 text-muted-foreground', className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayActivities.map((activity, index) => (
        <ActivityItem key={index} {...activity} />
      ))}
    </div>
  );
}

// Timeline view for activities
interface ActivityTimelineProps {
  activities: Array<{
    type: ActivityType;
    title: string;
    description?: string;
    time: string;
    date: string;
  }>;
  className?: string;
}

export function ActivityTimeline({
  activities,
  className,
}: ActivityTimelineProps) {
  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {} as Record<string, typeof activities>);

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(groupedActivities).map(([date, items]) => (
        <div key={date}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            {date}
          </h4>
          <div className="space-y-3">
            {items.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
