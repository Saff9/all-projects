'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

interface CronField {
  name: string;
  value: number | '*';
  step?: number;
}

const CRON_FIELDS = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'day of month', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'day of week', min: 0, max: 6 },
];

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseField = (value: string, field: typeof CRON_FIELDS[0]): { value: number | '*', step?: number } => {
  if (value === '*') {
    return { value: '*' };
  }

  if (value.includes('/')) {
    const [_, step] = value.split('/');
    return { value: '*', step: parseInt(step, 10) };
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-').map(Number);
    return { value: start };
  }

  if (value.includes(',')) {
    return { value: parseInt(value.split(',')[0], 10) };
  }

  return { value: parseInt(value, 10) };
};

const parseCron = (cron: string): { fields: CronField[], valid: boolean, error?: string } => {
  const parts = cron.trim().split(/\s+/);

  if (parts.length !== 5) {
    return { fields: [], valid: false, error: 'Cron expression must have exactly 5 fields' };
  }

  const fields: CronField[] = [];

  for (let i = 0; i < 5; i++) {
    const parsed = parseField(parts[i], CRON_FIELDS[i]);
    fields.push({ name: CRON_FIELDS[i].name, ...parsed });
  }

  return { fields, valid: true };
};

const getNextExecutions = (cron: string, count: number = 5): Date[] => {
  const dates: Date[] = [];
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);

  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return dates;

  const [minPart, hourPart, domPart, monPart, dowPart] = parts;

  const getValues = (part: string, min: number, max: number): number[] => {
    if (part === '*') {
      return Array.from({ length: max - min + 1 }, (_, i) => min + i);
    }

    if (part.includes('/')) {
      const [_, step] = part.split('/');
      const stepVal = parseInt(step, 10);
      return Array.from({ length: Math.floor((max - min) / stepVal) + 1 }, (_, i) => min + i * stepVal);
    }

    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    if (part.includes(',')) {
      return part.split(',').map(Number);
    }

    return [parseInt(part, 10)];
  };

  const minutes = getValues(minPart, 0, 59);
  const hours = getValues(hourPart, 0, 23);
  const daysOfMonth = getValues(domPart, 1, 31);
  const months = getValues(monPart, 1, 12);
  const daysOfWeek = getValues(dowPart, 0, 6);

  const current = new Date(now);
  
  while (dates.length < count) {
    current.setMinutes(current.getMinutes() + 1);

    const m = current.getMonth() + 1;
    const dom = current.getDate();
    const dow = current.getDay();
    const h = current.getHours();
    const min = current.getMinutes();

    if (months.includes(m) && 
        daysOfMonth.includes(dom) &&
        (daysOfWeek.includes(dow) || daysOfWeek.length === 7)) {
      if (hours.includes(h) && minutes.includes(min)) {
        dates.push(new Date(current));
      }
    }

    if (dates.length >= 1000) break;
  }

  return dates;
};

const describeCron = (cron: string): string => {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid cron expression';

  const [minPart, hourPart, domPart, monPart, dowPart] = parts;

  const describeField = (part: string, field: typeof CRON_FIELDS[0], unit: string): string => {
    if (part === '*') {
      return `every ${unit}`;
    }

    if (part.includes('/')) {
      const [_, step] = part.split('/');
      return `every ${step} ${unit}s`;
    }

    if (part.includes('-')) {
      const [start, end] = part.split('-');
      return `${unit}s ${start} through ${end}`;
    }

    if (part.includes(',')) {
      return `${unit}s ${part.split(',').join(', ')}`;
    }

    return unit === 'month' ? MONTH_NAMES[parseInt(part)] || part : 
           unit === 'day of week' ? DAY_NAMES[parseInt(part)] || part :
           part;
  };

  const partsDesc = [
    describeField(minPart, CRON_FIELDS[0], 'minute'),
    describeField(hourPart, CRON_FIELDS[1], 'hour'),
    describeField(domPart, CRON_FIELDS[2], 'day'),
    describeField(monPart, CRON_FIELDS[3], 'month'),
    describeField(dowPart, CRON_FIELDS[4], 'day'),
  ];

  return `Runs ${partsDesc.join(', ')}`;
};

export default function CronParser() {
  const [cron, setCron] = useState('');
  const [parsed, setParsed] = useState<{ fields: CronField[], valid: boolean, error?: string } | null>(null);
  const [nextExecutions, setNextExecutions] = useState<Date[]>([]);
  const [description, setDescription] = useState('');

  const parse = useCallback(() => {
    if (!cron.trim()) {
      setParsed(null);
      setNextExecutions([]);
      setDescription('');
      return;
    }

    const result = parseCron(cron);
    setParsed(result);

    if (result.valid) {
      setNextExecutions(getNextExecutions(cron, 5));
      setDescription(describeCron(cron));
    } else {
      setNextExecutions([]);
      setDescription('');
    }
  }, [cron]);

  const formatDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Cron Parser
        </h1>
        <p className="text-gray-400">
          Parse cron expressions and see the next execution times.
        </p>
      </div>

      <div className="mb-6">
        <TextArea
          label="Cron Expression"
          value={cron}
          onChange={(val) => {
            setCron(val);
            setParsed(null);
            setNextExecutions([]);
            setDescription('');
          }}
          placeholder="*/5 * * * *"
          rows={3}
        />
        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={parse}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Parse
          </button>
          <button
            onClick={() => setCron('*/5 * * * *')}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Every 5 min
          </button>
          <button
            onClick={() => setCron('0 * * * *')}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Every hour
          </button>
          <button
            onClick={() => setCron('0 0 * * *')}
            className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 
                       transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            Daily at midnight
          </button>
        </div>
      </div>

      {parsed && !parsed.valid && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {parsed.error}
        </div>
      )}

      {parsed && parsed.valid && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Schedule Description</h3>
            <p className="text-gray-300">{description}</p>
          </div>

          <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Next 5 Executions</h3>
            {nextExecutions.length > 0 ? (
              <ul className="space-y-2">
                {nextExecutions.map((date, i) => (
                  <li key={i} className="text-gray-300 font-mono text-sm">
                    {formatDate(date)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No upcoming executions</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
