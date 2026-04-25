'use client';

import { useState, useCallback, useEffect } from 'react';
import { Copy, Check, Clock } from 'lucide-react';

const presets = [
  { name: 'Every Minute', cron: '* * * * *' },
  { name: 'Every Hour', cron: '0 * * * *' },
  { name: 'Every Day at Midnight', cron: '0 0 * * *' },
  { name: 'Every Week', cron: '0 0 * * 0' },
  { name: 'Every Month', cron: '0 0 1 * *' },
  { name: 'Every 5 Minutes', cron: '*/5 * * * *' },
  { name: 'Every 30 Minutes', cron: '*/30 * * * *' },
  { name: 'Every Day at Noon', cron: '0 12 * * *' },
];

const generateNextRuns = (cron: string): string[] => {
  const runs: string[] = [];
  const now = new Date();
  
  // Simple parser for demonstration
  const parts = cron.split(' ');
  if (parts.length !== 5) return ['Invalid cron expression'];
  
  const [minute, hour, day, month, dow] = parts;
  
  for (let i = 1; i <= 10; i++) {
    const next = new Date(now);
    next.setMinutes(next.getMinutes() + i);
    
    const checkMatch = (pattern: string, value: number): boolean => {
      if (pattern === '*') return true;
      if (pattern.includes('/')) {
        const [, step] = pattern.split('/');
        return value % parseInt(step) === 0;
      }
      if (pattern.includes(',')) {
        return pattern.split(',').map(p => parseInt(p)).includes(value);
      }
      if (pattern.includes('-')) {
        const [start, end] = pattern.split('-').map(p => parseInt(p));
        return value >= start && value <= end;
      }
      return parseInt(pattern) === value;
    };
    
    if (
      checkMatch(minute, next.getMinutes()) &&
      checkMatch(hour, next.getHours()) &&
      checkMatch(day, next.getDate()) &&
      checkMatch(month, next.getMonth() + 1) &&
      checkMatch(dow, next.getDay())
    ) {
      runs.push(next.toLocaleString());
      if (runs.length >= 5) break;
    }
  }
  
  return runs.length > 0 ? runs : ['No upcoming matches found'];
};

export default function CronGenerator() {
  const [minute, setMinute] = useState('*');
  const [hour, setHour] = useState('*');
  const [day, setDay] = useState('*');
  const [month, setMonth] = useState('*');
  const [dow, setDow] = useState('*');
  const [cron, setCron] = useState('* * * * *');
  const [nextRuns, setNextRuns] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const updateCron = useCallback(() => {
    const newCron = `${minute} ${hour} ${day} ${month} ${dow}`;
    setCron(newCron);
    setNextRuns(generateNextRuns(newCron));
  }, [minute, hour, day, month, dow]);

  useEffect(() => {
    updateCron();
  }, [updateCron]);

  const applyPreset = (presetCron: string) => {
    const parts = presetCron.split(' ');
    setMinute(parts[0]);
    setHour(parts[1]);
    setDay(parts[2]);
    setMonth(parts[3]);
    setDow(parts[4]);
  };

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [cron]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Cron Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Interactive cron expression builder with visual controls.
        </p>
      </div>

      {/* Presets */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Common Presets</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.cron)}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Cron Expression Display */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/80 mb-1">Generated Cron Expression</p>
            <code className="text-3xl font-mono text-white">{cron}</code>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Visual Builders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Minute */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Clock className="w-4 h-4" /> Minute (0-59)
          </label>
          <select
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">Every minute (*)</option>
            <option value="*/5">Every 5 minutes (*/5)</option>
            <option value="*/15">Every 15 minutes (*/15)</option>
            <option value="*/30">Every 30 minutes (*/30)</option>
            {Array.from({ length: 12 }, (_, i) => `${i * 5}`).map((m) => (
              <option key={m} value={m}>At minute {m}</option>
            ))}
          </select>
        </div>

        {/* Hour */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Clock className="w-4 h-4" /> Hour (0-23)
          </label>
          <select
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">Every hour (*)</option>
            <option value="*/2">Every 2 hours (*/2)</option>
            <option value="*/4">Every 4 hours (*/4)</option>
            {Array.from({ length: 24 }, (_, i) => i).map((h) => (
              <option key={h} value={h}>At {h}:00</option>
            ))}
          </select>
        </div>

        {/* Day of Month */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Clock className="w-4 h-4" /> Day of Month (1-31)
          </label>
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">Every day (*)</option>
            <option value="1">Day 1</option>
            <option value="15">Day 15</option>
            <option value="*/7">Every 7 days (*/7)</option>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Day {d}</option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Clock className="w-4 h-4" /> Month (1-12)
          </label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">Every month (*)</option>
            <option value="*/3">Every 3 months (*/3)</option>
            <option value="1">January</option>
            <option value="6">June</option>
            <option value="12">December</option>
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>

        {/* Day of Week */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
            <Clock className="w-4 h-4" /> Day of Week (0-6)
          </label>
          <select
            value={dow}
            onChange={(e) => setDow(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="*">Every day (*)</option>
            <option value="0">Sunday</option>
            <option value="1">Monday</option>
            <option value="5">Friday</option>
            <option value="6">Saturday</option>
            <option value="0,6">Weekends (0,6)</option>
            <option value="1,2,3,4,5">Weekdays (1-5)</option>
          </select>
        </div>
      </div>

      {/* Next Runs */}
      <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Next 5 Execution Times</h3>
        <div className="space-y-2">
          {nextRuns.map((run, index) => (
            <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {run}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
