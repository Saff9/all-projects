
'use client';

import { useEffect, useState } from 'react';
import { getStats } from '@/lib/db';

interface VisitorStats {
  totalVisitors: number;
  dailyVisitors: number;
}

export function VisitorStats() {
  const [stats, setStats] = useState<VisitorStats>({ totalVisitors: 0, dailyVisitors: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/visitors', { method: 'POST' });
    fetch('/api/stats')
      .then(res => res.json())
      .then((data: VisitorStats) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-tertiary">Loading...</div>;

  return (
    <div className="text-xs text-tertiary">
      👥 {stats.totalVisitors.toLocaleString()} total |{' '}
      📊 {stats.dailyVisitors} today
    </div>
  );
}

