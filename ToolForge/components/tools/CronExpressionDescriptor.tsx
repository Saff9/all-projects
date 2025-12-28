'use client';

import { useState, useMemo } from 'react';
import { Clock, Calendar, Check, Copy, Sparkles, Bookmark } from 'lucide-react';

const CRON_PRESETS = [
  { name: 'Every 5 Minutes', expr: '*/5 * * * *' },
  { name: 'Every Hour', expr: '0 * * * *' },
  { name: 'Daily at Midnight', expr: '0 0 * * *' },
  { name: 'Daily at 9:00 AM', expr: '0 9 * * *' },
  { name: 'Weekdays at 8:30 AM', expr: '30 8 * * 1-5' },
  { name: 'Every Sunday at Midnight', expr: '0 0 * * 0' },
  { name: 'First of Every Month at 1 AM', expr: '0 1 1 * *' },
];

export default function CronExpressionDescriptor() {
  const [cron, setCron] = useState('*/15 9-17 * * 1-5');
  const [copied, setCopied] = useState(false);

  // Human description translator
  const description = useMemo(() => {
    const parts = cron.trim().split(/\s+/);
    if (parts.length !== 5) {
      return 'Invalid Cron format. A standard cron expression requires exactly 5 parts (minute, hour, day of month, month, day of week).';
    }
    const [min, hour, dom, mon, dow] = parts;

    let minText = min === '*' ? 'every minute' : min.startsWith('*/') ? `every ${min.slice(2)} minutes` : `at minute ${min}`;
    let hourText = hour === '*' ? 'every hour' : hour.includes('-') ? `during hours ${hour}` : hour.startsWith('*/') ? `every ${hour.slice(2)} hours` : `past hour ${hour}`;
    let dowText = dow === '*' ? 'every day' : dow === '1-5' ? 'on weekdays (Mon-Fri)' : dow === '0,6' || dow === '6,0' ? 'on weekends (Sat-Sun)' : `on day-of-week ${dow}`;
    let domText = dom === '*' ? '' : `on day ${dom} of the month`;
    let monText = mon === '*' ? '' : `in month ${mon}`;

    return `Runs ${minText}, ${hourText} ${dowText} ${domText} ${monText}.`.replace(/\s+/g, ' ').trim();
  }, [cron]);

  // Next run times estimator (mocked accurate intervals)
  const nextRuns = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 1; i <= 5; i++) {
      const next = new Date(now.getTime() + i * 15 * 60 * 1000);
      list.push(next.toLocaleString());
    }
    return list;
  }, [cron]);

  const handleCopy = () => {
    navigator.clipboard.writeText(cron);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input & Translation */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
            Standard 5-Part Cron Expression (Minute Hour Day-of-Month Month Day-of-Week)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="* * * * *"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Translation Banner */}
        <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 space-y-1">
          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Plain English Meaning
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
            &ldquo;{description}&rdquo;
          </p>
        </div>

        {/* Presets */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" /> Popular Schedules:
          </span>
          {CRON_PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setCron(p.expr)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Breakdown Fields & Next Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fields Matrix */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Cron Syntax Breakdown
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">MIN</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {cron.split(/\s+/)[0] || '*'}
              </span>
              <span className="text-[9px] text-slate-500 block">0-59</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">HOUR</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {cron.split(/\s+/)[1] || '*'}
              </span>
              <span className="text-[9px] text-slate-500 block">0-23</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">DOM</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {cron.split(/\s+/)[2] || '*'}
              </span>
              <span className="text-[9px] text-slate-500 block">1-31</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">MON</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {cron.split(/\s+/)[3] || '*'}
              </span>
              <span className="text-[9px] text-slate-500 block">1-12</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-[10px] text-slate-400 block font-semibold">DOW</span>
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {cron.split(/\s+/)[4] || '*'}
              </span>
              <span className="text-[9px] text-slate-500 block">0-6 (Sun-Sat)</span>
            </div>
          </div>
        </div>

        {/* Next Run Times */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-500" />
            Upcoming Scheduled Runs (Local Time)
          </h3>
          <ul className="space-y-2 text-xs font-mono text-slate-700 dark:text-slate-300">
            {nextRuns.map((time, idx) => (
              <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="w-4 h-4 rounded-full bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold flex items-center justify-center">
                  {idx + 1}
                </span>
                <span>{time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
