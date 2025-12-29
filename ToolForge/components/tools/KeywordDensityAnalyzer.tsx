'use client';

import { useState, useMemo } from 'react';
import { BarChart2, Filter, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by',
  'could', 'did', 'do', 'does', 'doing', 'down', 'during',
  'each', 'few', 'for', 'from', 'further',
  'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how',
  'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself',
  'just', 'me', 'more', 'most', 'my', 'myself',
  'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'she', 'should', 'so', 'some', 'such',
  'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too',
  'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves'
]);

export default function KeywordDensityAnalyzer() {
  const [text, setText] = useState(
    'Search engine optimization (SEO) is the process of improving the quality and quantity of website traffic to a website or a web page from search engines. SEO targets unpaid traffic rather than direct traffic or paid traffic. Using the right SEO tools and keyword research techniques allows webmasters to rank higher on search engines and attract organic visitors. Good on-page SEO includes optimizing meta tags, improving page speed, writing high quality content, and analyzing keyword density.'
  );
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const [ngramTab, setNgramTab] = useState<'1' | '2' | '3'>('1');

  const analysis = useMemo(() => {
    if (!text.trim()) {
      return { totalWords: 0, uniqueWords: 0, readingTime: '0 min', ngrams: { '1': [], '2': [], '3': [] } };
    }

    // Tokenize
    const rawTokens = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);

    const totalWords = rawTokens.length;
    const readingTime = `${Math.ceil(totalWords / 200)} min`;

    const getFrequencies = (n: number) => {
      const map: Record<string, number> = {};
      for (let i = 0; i <= rawTokens.length - n; i++) {
        const slice = rawTokens.slice(i, i + n);
        if (excludeStopWords) {
          // If 1-gram is stop word, skip
          if (n === 1 && STOP_WORDS.has(slice[0])) continue;
          // If n-gram consists only of stop words, skip
          if (slice.every((w) => STOP_WORDS.has(w))) continue;
        }
        const phrase = slice.join(' ');
        map[phrase] = (map[phrase] || 0) + 1;
      }

      return Object.entries(map)
        .map(([phrase, count]) => ({
          phrase,
          count,
          density: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : '0.00',
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    };

    const oneGrams = getFrequencies(1);
    const twoGrams = getFrequencies(2);
    const threeGrams = getFrequencies(3);

    return {
      totalWords,
      uniqueWords: new Set(rawTokens).size,
      readingTime,
      ngrams: {
        '1': oneGrams,
        '2': twoGrams,
        '3': threeGrams,
      },
    };
  }, [text, excludeStopWords]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Content Input Column */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Content Editor
            </h2>
            <button
              onClick={() => setText('')}
              className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear Text
            </button>
          </div>

          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article or copy here to analyze keyword frequency..."
            className="w-full p-4 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
          />

          {/* Controls */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={excludeStopWords}
                onChange={(e) => setExcludeStopWords(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
              />
              Exclude Common Stop Words (the, is, and, to...)
            </label>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Total Words</span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {analysis.totalWords}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Unique Words</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {analysis.uniqueWords}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Est. Read Time</span>
            <span className="text-xl font-black text-teal-600 dark:text-teal-400">
              {analysis.readingTime}
            </span>
          </div>
        </div>
      </div>

      {/* Density Tables Column */}
      <div className="lg:col-span-6 space-y-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-500" />
              Keyword Density &amp; N-Grams
            </h3>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-medium">
              <button
                onClick={() => setNgramTab('1')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  ngramTab === '1'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                1-Word
              </button>
              <button
                onClick={() => setNgramTab('2')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  ngramTab === '2'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                2-Words
              </button>
              <button
                onClick={() => setNgramTab('3')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  ngramTab === '3'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                3-Words
              </button>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-2.5">Keyword / Phrase</th>
                  <th className="p-2.5 text-center">Occurrences</th>
                  <th className="p-2.5 text-right">Density %</th>
                  <th className="p-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {analysis.ngrams[ngramTab].length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No matching phrases found.
                    </td>
                  </tr>
                ) : (
                  analysis.ngrams[ngramTab].map((item, idx) => {
                    const d = parseFloat(item.density);
                    const isHigh = d > 3.0;
                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200 font-mono">
                          {item.phrase}
                        </td>
                        <td className="p-2.5 text-center text-slate-600 dark:text-slate-400">
                          {item.count}
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-900 dark:text-slate-100">
                          {item.density}%
                        </td>
                        <td className="p-2.5 text-right">
                          {isHigh ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                              <AlertTriangle className="w-3 h-3" /> High
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Optimal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
