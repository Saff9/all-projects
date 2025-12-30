'use client';

import { useState, useMemo } from 'react';
import { Link, Copy, Check, Sparkles, Filter } from 'lucide-react';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it', 'its',
  'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
  'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how'
]);

export default function UrlSlugGenerator() {
  const [title, setTitle] = useState('Top 10 High-Traffic SEO Tools & Free Web Utilities in 2026!');
  const [separator, setSeparator] = useState<'-' | '_'>('-');
  const [removeStopWords, setRemoveStopWords] = useState(true);
  const [maxLength, setMaxLength] = useState<number>(60);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(() => {
    if (!title.trim()) return '';

    // 1. Normalize accents (e.g. é -> e, ü -> u)
    let s = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 2. Lowercase
    s = s.toLowerCase();

    // 3. Replace non-alphanumeric with spaces
    s = s.replace(/[^a-z0-9\s]/g, ' ');

    // 4. Tokenize
    let tokens = s.trim().split(/\s+/).filter(Boolean);

    // 5. Remove stop words if enabled
    if (removeStopWords) {
      tokens = tokens.filter((w) => !STOP_WORDS.has(w));
    }

    let joined = tokens.join(separator);

    // 6. Max length trim
    if (maxLength > 0 && joined.length > maxLength) {
      joined = joined.slice(0, maxLength);
      // clean trailing separator
      if (joined.endsWith(separator)) {
        joined = joined.slice(0, -1);
      }
    }

    return joined;
  }, [title, separator, removeStopWords, maxLength]);

  const handleCopy = () => {
    navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls & Input Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Article Headline or Page Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="e.g. Best 15 Tips For Next.js SEO Optimization"
            />
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Word Separator
              </span>
              <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                <button
                  onClick={() => setSeparator('-')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    separator === '-'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Hyphen (-) [SEO Standard]
                </button>
                <button
                  onClick={() => setSeparator('_')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    separator === '_'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Underscore (_)
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Strip Common Stop Words
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Removes &quot;a, the, in, for, of, with...&quot; for cleaner URLs
                </span>
              </div>
              <input
                type="checkbox"
                checked={removeStopWords}
                onChange={(e) => setRemoveStopWords(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                <span>Maximum Character Length</span>
                <span className="font-mono">{maxLength} chars</span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                value={maxLength}
                onChange={(e) => setMaxLength(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Output Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-teal-500" />
              Generated SEO Slug
            </h3>
            <span className="text-xs font-mono text-slate-400">{slug.length} chars</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-sm break-all border border-slate-800 flex items-center justify-between gap-3">
            <span>{slug || 'your-slug-will-appear-here'}</span>
          </div>

          <button
            onClick={handleCopy}
            disabled={!slug}
            className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Clean Slug'}
          </button>

          {/* Example live URL */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Live URL Appearance
            </span>
            <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 truncate">
              https://example.com/blog/<span className="font-bold underline">{slug || 'my-article'}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
