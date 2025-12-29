'use client';

import { useState, useMemo } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, Bookmark, Copy, Check } from 'lucide-react';

const PRESETS = [
  { name: 'Email Address', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$', flags: 'gm', sample: 'test.user@example.com\nhello@domain.org\ninvalid_email@' },
  { name: 'URL / Web Link', pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*)', flags: 'g', sample: 'Check https://toolforge-seo.vercel.app and http://example.com/api?v=1' },
  { name: 'IPv4 Address', pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b', flags: 'g', sample: 'Local: 127.0.0.1, DNS: 8.8.8.8, Invalid: 999.1.1.1' },
  { name: 'Hex Color Code', pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b', flags: 'gi', sample: 'Colors: #ffffff, #6366f1, #4f46e5, and #000' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\b\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])\\b', flags: 'g', sample: 'Release date: 2026-08-31, Next run: 2026-12-25' },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState('\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}\\b');
  const [flags, setFlags] = useState({ g: true, i: true, m: false, s: false });
  const [testText, setTestText] = useState(
    'Contact our team at support@toolforge.io or dev-help@example.com for assistance. Invalid: admin@'
  );

  const activeFlagsString = Object.entries(flags)
    .filter(([_, val]) => val)
    .map(([key]) => key)
    .join('');

  const result = useMemo(() => {
    if (!pattern.trim()) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, activeFlagsString);
      const matches: { match: string; index: number; groups: string[] }[] = [];

      if (flags.g) {
        let m: RegExpExecArray | null;
        let count = 0;
        while ((m = regex.exec(testText)) !== null && count < 100) {
          matches.push({
            match: m[0],
            index: m.index,
            groups: m.slice(1),
          });
          if (m[0].length === 0) regex.lastIndex++;
          count++;
        }
      } else {
        const m = regex.exec(testText);
        if (m) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        }
      }

      return { matches, error: null };
    } catch (e: any) {
      return { matches: [], error: e.message };
    }
  }, [pattern, activeFlagsString, testText, flags.g]);

  const loadPreset = (preset: (typeof PRESETS)[0]) => {
    setPattern(preset.pattern);
    setTestText(preset.sample);
    setFlags({
      g: preset.flags.includes('g'),
      i: preset.flags.includes('i'),
      m: preset.flags.includes('m'),
      s: preset.flags.includes('s'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Pattern Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Regular Expression Pattern
          </label>
          <div className="flex items-center gap-2">
            <span className="text-lg font-mono font-bold text-slate-400">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. [a-z0-9]+"
            />
            <span className="text-lg font-mono font-bold text-slate-400">/{activeFlagsString}</span>
          </div>
        </div>

        {/* Flag toggles */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Flags:</span>
          {(['g', 'i', 'm', 's'] as const).map((flag) => (
            <label key={flag} className="flex items-center gap-1.5 cursor-pointer font-mono font-bold">
              <input
                type="checkbox"
                checked={flags[flag]}
                onChange={(e) => setFlags({ ...flags, [flag]: e.target.checked })}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span>
                {flag} ({flag === 'g' ? 'Global' : flag === 'i' ? 'Insensitive' : flag === 'm' ? 'Multiline' : 'DotAll'})
              </span>
            </label>
          ))}
        </div>

        {/* Presets Toolbar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" /> Presets:
          </span>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => loadPreset(p)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Status / Error Banner */}
      {result.error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>Regex Error: {result.error}</span>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold">
              {result.matches.length} {result.matches.length === 1 ? 'Match' : 'Matches'} Found
            </span>
          </div>
        </div>
      )}

      {/* Editor & Matches Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Test String
          </label>
          <textarea
            rows={10}
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-mono border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="lg:col-span-6 space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Match Details &amp; Groups
          </label>
          <div className="h-[255px] overflow-y-auto p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono space-y-2">
            {result.matches.length === 0 ? (
              <p className="text-slate-500 italic">No matches in test string.</p>
            ) : (
              result.matches.map((m, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900 border border-slate-800 flex items-start justify-between">
                  <div>
                    <span className="text-indigo-400 font-bold">#{idx + 1}: </span>
                    <span className="text-emerald-400 font-bold">&quot;{m.match}&quot;</span>
                    <span className="text-slate-500 text-[11px] block mt-0.5">Index: {m.index}</span>
                  </div>
                  {m.groups.length > 0 && (
                    <span className="text-[10px] text-teal-400">
                      Groups: {m.groups.join(', ')}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
