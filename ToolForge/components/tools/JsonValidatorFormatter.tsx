'use client';

import { useState } from 'react';
import { FileCode, Check, Copy, Download, Trash2, AlertCircle, CheckCircle2, Sparkles } from 'lucide-react';

export default function JsonValidatorFormatter() {
  const [input, setInput] = useState(`{
  "site": "ToolForge",
  "version": 1.0,
  "features": [
    "100% Client-Side",
    "Zero Latency",
    "SEO Optimized"
  ],
  "author": {
    "name": "Alex",
    "role": "Lead Engineer"
  }
}`);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rawSize: number; minSize: number; savings: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleJson = () => {
    setInput(`{
  "status": "success",
  "timestamp": 1740000000,
  "data": {
    "user": {
      "id": "usr_9481a8",
      "username": "coder_pro",
      "roles": ["admin", "developer"],
      "verified": true
    },
    "tools": [
      { "id": 1, "name": "JSON Beautifier" },
      { "id": 2, "name": "WCAG Checker" }
    ]
  }
}`);
    setError(null);
  };

  const handleFormat = (spaces: number) => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, spaces);
      const minified = JSON.stringify(parsed);
      setOutput(formatted);
      setError(null);

      const raw = new Blob([input]).size;
      const min = new Blob([minified]).size;
      const savings = raw > 0 ? (((raw - min) / raw) * 100).toFixed(1) : '0';
      setStats({ rawSize: raw, minSize: min, savings });
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setOutput('');
      setStats(null);
    }
  };

  const handleMinify = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError(null);

      const raw = new Blob([input]).size;
      const min = new Blob([minified]).size;
      const savings = raw > 0 ? (((raw - min) / raw) * 100).toFixed(1) : '0';
      setStats({ rawSize: raw, minSize: min, savings });
    } catch (err: any) {
      setError(err.message || 'Invalid JSON syntax');
      setOutput('');
      setStats(null);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output || input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToSave = output || input;
    const blob = new Blob([textToSave], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'formatted-data.json';
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleFormat(2)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            Beautify (2 Spaces)
          </button>
          <button
            onClick={() => handleFormat(4)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Beautify (4 Spaces)
          </button>
          <button
            onClick={handleMinify}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
          >
            Minify JSON
          </button>
          <button
            onClick={sampleJson}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
          >
            Load Sample
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInput('');
              setOutput('');
              setError(null);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download .json
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Error / Success Status Banner */}
      {error ? (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>JSON Syntax Error: {error}</span>
        </div>
      ) : output ? (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Valid JSON Structure!</span>
          </div>
          {stats && (
            <span className="text-[11px] font-sans text-emerald-600 dark:text-emerald-400">
              Raw: {stats.rawSize} B | Minified: {stats.minSize} B ({stats.savings}% smaller)
            </span>
          )}
        </div>
      ) : null}

      {/* Editor Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Input JSON Code</span>
            <span className="text-[11px] font-normal text-slate-400">Paste or type here</span>
          </label>
          <textarea
            rows={18}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-4 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono border border-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
            placeholder="Paste your JSON here..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Formatted / Minified Output</span>
            <span className="text-[11px] font-normal text-slate-400">Ready to copy</span>
          </label>
          <textarea
            readOnly
            rows={18}
            value={output || input}
            className="w-full p-4 rounded-2xl bg-slate-950 text-emerald-400 text-xs font-mono border border-slate-800 focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
