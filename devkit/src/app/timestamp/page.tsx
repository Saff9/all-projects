'use client';

import { useState, useCallback, useEffect } from 'react';

// Timezone options
const timezones = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Local', value: 'local' },
  { label: 'PST (UTC-8)', value: 'America/Los_Angeles' },
  { label: 'MST (UTC-7)', value: 'America/Denver' },
  { label: 'CST (UTC-6)', value: 'America/Chicago' },
  { label: 'EST (UTC-5)', value: 'America/New_York' },
  { label: 'GMT', value: 'Europe/London' },
  { label: 'CET (UTC+1)', value: 'Europe/Paris' },
  { label: 'EET (UTC+2)', value: 'Europe/Helsinki' },
  { label: 'IST (UTC+5:30)', value: 'Asia/Kolkata' },
  { label: 'CST (UTC+8)', value: 'Asia/Shanghai' },
  { label: 'JST (UTC+9)', value: 'Asia/Tokyo' },
  { label: 'AEST (UTC+10)', value: 'Australia/Sydney' },
];

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState('');
  const [dateString, setDateString] = useState('');
  const [now, setNow] = useState(new Date());
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [duration, setDuration] = useState('');
  const [activeTab, setActiveTab] = useState<'convert' | 'duration' | 'natural'>('convert');
  const [naturalInput, setNaturalInput] = useState('');
  const [naturalResult, setNaturalResult] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getDateInTimezone = useCallback((date: Date, tz: string) => {
    if (tz === 'UTC') return date.toUTCString();
    if (tz === 'local') return date.toLocaleString();
    try {
      return date.toLocaleString('en-US', { timeZone: tz });
    } catch {
      return date.toString();
    }
  }, []);

  const formatTimestamp = useCallback((ts: number) => {
    const date = new Date(ts);
    return {
      unix: Math.floor(ts / 1000),
      unixMs: ts,
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      rfc2822: date.toString(),
      relative: getRelativeTime(ts),
      timezone: getDateInTimezone(date, selectedTimezone),
    };
  }, [selectedTimezone, getDateInTimezone]);

  const timestampToDate = useCallback(() => {
    try {
      if (!timestamp) return;
      let ts = parseInt(timestamp);
      // Handle both seconds and milliseconds
      if (ts < 10000000000) {
        ts = ts * 1000;
      }
      const date = new Date(ts);
      setDateString(date.toISOString());
    } catch {
      setDateString('Invalid timestamp');
    }
  }, [timestamp]);

  const dateToTimestamp = useCallback(() => {
    try {
      if (!dateString) return;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        setTimestamp('Invalid date');
        return;
      }
      setTimestamp(Math.floor(date.getTime() / 1000).toString());
    } catch {
      setTimestamp('Invalid date');
    }
  }, [dateString]);

  const setCurrentTimestamp = useCallback(() => {
    const now = new Date();
    setTimestamp(Math.floor(now.getTime() / 1000).toString());
    setDateString(now.toISOString());
    setCalendarDate(now.toISOString().split('T')[0]);
  }, []);

  const calculateDuration = useCallback(() => {
    try {
      const from = new Date(fromDate).getTime();
      const to = new Date(toDate).getTime();
      if (isNaN(from) || isNaN(to)) {
        setDuration('Invalid date');
        return;
      }
      const diff = Math.abs(to - from);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      let result = '';
      if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
      if (hours > 0) result += `${hours} hour${hours > 1 ? 's' : ''} `;
      if (minutes > 0) result += `${minutes} minute${minutes > 1 ? 's' : ''} `;
      if (seconds > 0) result += `${seconds} second${seconds > 1 ? 's' : ''}`;
      
      setDuration(result.trim() || '0 seconds');
    } catch {
      setDuration('Error calculating duration');
    }
  }, [fromDate, toDate]);

  const parseNaturalLanguage = useCallback((input: string) => {
    const now = Date.now();
    const lower = input.toLowerCase();
    let parsed: Date | null = null;
    let offset = 0;

    // Relative time patterns
    if (lower.includes('now')) {
      parsed = new Date(now);
    }
    if (lower.includes('today')) {
      parsed = new Date();
      parsed.setHours(0, 0, 0, 0);
    }
    if (lower.includes('tomorrow')) {
      parsed = new Date();
      parsed.setDate(parsed.getDate() + 1);
    }
    if (lower.includes('yesterday')) {
      parsed = new Date();
      parsed.setDate(parsed.getDate() - 1);
    }
    
    // ISO date patterns
    const isoMatch = input.match(/(\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?)/);
    if (isoMatch) {
      parsed = new Date(isoMatch[1]);
    }
    
    // Relative days
    const dayMatch = lower.match(/(\d+)\s*day[s]?\s*(ago|from now|later)?/);
    if (dayMatch) {
      const days = parseInt(dayMatch[1]);
      const direction = dayMatch[2] || '';
      if (direction === 'ago' || !direction) {
        parsed = new Date(now - days * 24 * 60 * 60 * 1000);
      } else if (direction === 'from now' || direction === 'later') {
        parsed = new Date(now + days * 24 * 60 * 60 * 1000);
      }
    }
    
    // Hours
    const hourMatch = lower.match(/(\d+)\s*hour[s]?\s*(ago|from now|later)?/);
    if (hourMatch) {
      const hours = parseInt(hourMatch[1]);
      const direction = hourMatch[2] || '';
      if (!parsed) parsed = new Date(now);
      if (direction === 'ago') {
        parsed.setTime(parsed.getTime() - hours * 60 * 60 * 1000);
      } else {
        parsed.setTime(parsed.getTime() + hours * 60 * 60 * 1000);
      }
    }
    
    // Minutes
    const minuteMatch = lower.match(/(\d+)\s*minute[s]?\s*(ago|from now|later)?/);
    if (minuteMatch) {
      const minutes = parseInt(minuteMatch[1]);
      const direction = minuteMatch[2] || '';
      if (!parsed) parsed = new Date(now);
      if (direction === 'ago') {
        parsed.setTime(parsed.getTime() - minutes * 60 * 1000);
      } else {
        parsed.setTime(parsed.getTime() + minutes * 60 * 1000);
      }
    }

    if (parsed && !isNaN(parsed.getTime())) {
      setNaturalResult(JSON.stringify({
        unix: Math.floor(parsed.getTime() / 1000),
        iso: parsed.toISOString(),
        local: parsed.toLocaleString(),
        relative: getRelativeTime(parsed.getTime()),
      }, null, 2));
    } else {
      setNaturalResult('Could not parse date. Try: "tomorrow", "3 days ago", "2 hours from now", "2024-01-15"');
    }
  }, []);

  useEffect(() => {
    if (naturalInput) {
      parseNaturalLanguage(naturalInput);
    }
  }, [naturalInput, parseNaturalLanguage]);

  const copyFormat = (format: string, value: string) => {
    navigator.clipboard.writeText(value);
  };

  const currentFormats = formatTimestamp(now.getTime());

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Timestamp Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert between Unix timestamps and human-readable dates.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('convert')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'convert'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Convert
        </button>
        <button
          onClick={() => setActiveTab('duration')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'duration'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Duration
        </button>
        <button
          onClick={() => setActiveTab('natural')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'natural'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Natural Language
        </button>
      </div>

      {activeTab === 'convert' && (
        <>
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Current Time</div>
                <div className="text-2xl font-mono text-blue-900 dark:text-blue-100">
                  {currentFormats.iso}
                </div>
              </div>
              <select
                value={selectedTimezone}
                onChange={(e) => setSelectedTimezone(e.target.value)}
                className="px-3 py-1 text-sm border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="font-mono text-blue-800 dark:text-blue-200">
                Unix: {currentFormats.unix}
              </div>
              <div className="font-mono text-blue-800 dark:text-blue-200">
                {selectedTimezone}: {currentFormats.timezone}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => copyFormat('unix', currentFormats.unix.toString())}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                Copy Unix
              </button>
              <button
                onClick={() => copyFormat('iso', currentFormats.iso)}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                Copy ISO
              </button>
              <button
                onClick={() => copyFormat('rfc', currentFormats.rfc2822)}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                Copy RFC2822
              </button>
              <button
                onClick={() => copyFormat('relative', currentFormats.relative)}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-700"
              >
                Copy Relative
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unix Timestamp (seconds or milliseconds)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="1704067200"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
                <button
                  onClick={timestampToDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Convert →
                </button>
                <button
                  onClick={setCurrentTimestamp}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date (ISO 8601)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dateString}
                  onChange={(e) => setDateString(e.target.value)}
                  placeholder="2024-01-01T00:00:00.000Z"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
                <button
                  onClick={dateToTimestamp}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← Convert
                </button>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Calendar Date
              </label>
              <input
                type="date"
                value={calendarDate}
                onChange={(e) => {
                  setCalendarDate(e.target.value);
                  const date = new Date(e.target.value);
                  setTimestamp(Math.floor(date.getTime() / 1000).toString());
                  setDateString(date.toISOString());
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {timestamp && dateString && !timestamp.includes('Invalid') && !dateString.includes('Invalid') && (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-3">Converted Result</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Unix (seconds):</span>
                    <span className="text-gray-900 dark:text-white">{Math.floor(parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000) / 1000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Unix (milliseconds):</span>
                    <span className="text-gray-900 dark:text-white">{parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">ISO 8601:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000)).toISOString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">UTC:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000)).toUTCString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Local:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">RFC 2822:</span>
                    <span className="text-gray-900 dark:text-white">{new Date(parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000)).toString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Relative:</span>
                    <span className="text-gray-900 dark:text-white">{getRelativeTime(parseInt(timestamp) * (timestamp.length > 10 ? 1 : 1000))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'duration' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Calculate Duration Between Two Dates</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">From Date</label>
                <input
                  type="datetime-local"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">To Date</label>
                <input
                  type="datetime-local"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={calculateDuration}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Calculate Duration
            </button>
          </div>

          {duration && (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-2">Duration</h3>
              <div className="text-2xl font-mono text-green-900 dark:text-green-100">{duration}</div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'natural' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Natural Language Input
            </label>
            <input
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g., 'tomorrow', '3 days ago', '2 hours from now', '2024-01-15'"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <p className="mt-2 text-xs text-gray-500">
              Try: "now", "today", "tomorrow", "yesterday", "3 days ago", "next friday", "2 weeks from now", "2024-01-01"
            </p>
          </div>

          {naturalResult && (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-400 mb-3">Parsed Result</h3>
              <pre className="text-sm font-mono text-green-900 dark:text-green-100 whitespace-pre-wrap">
                {naturalResult}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(Math.abs(diff) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  const suffix = diff > 0 ? ' ago' : ' from now';
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}${suffix}`;
  if (months > 0) return `${months} month${months > 1 ? 's' : ''}${suffix}`;
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''}${suffix}`;
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}${suffix}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}${suffix}`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}${suffix}`;
  return `${seconds} second${seconds > 1 ? 's' : ''}${suffix}`;
}
