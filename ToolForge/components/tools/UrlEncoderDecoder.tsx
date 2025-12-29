'use client';

import { useState, useEffect } from 'react';
import { Link2, Copy, Check, Plus, Trash2, ArrowRightLeft, Sparkles } from 'lucide-react';

interface QueryParam {
  key: string;
  value: string;
}

export default function UrlEncoderDecoder() {
  const [inputUrl, setInputUrl] = useState(
    'https://example.com/search?q=free%20seo%20tools&category=developer&filter=2026'
  );
  const [encodeMode, setEncodeMode] = useState<'component' | 'full'>('component');
  const [parsedProtocol, setParsedProtocol] = useState('');
  const [parsedHost, setParsedHost] = useState('');
  const [parsedPath, setParsedPath] = useState('');
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);
  const [copied, setCopied] = useState(false);

  // Parse URL on input change
  useEffect(() => {
    try {
      const urlObj = new URL(inputUrl);
      setParsedProtocol(urlObj.protocol);
      setParsedHost(urlObj.host);
      setParsedPath(urlObj.pathname);

      const params: QueryParam[] = [];
      urlObj.searchParams.forEach((val, key) => {
        params.push({ key, value: val });
      });
      setQueryParams(params);
    } catch {
      // Not a full URL, fallback
      setParsedProtocol('');
      setParsedHost('');
      setParsedPath('');
      setQueryParams([]);
    }
  }, [inputUrl]);

  // Reconstruct URL from params
  const updateParam = (index: number, field: 'key' | 'value', newVal: string) => {
    const updated = [...queryParams];
    updated[index][field] = newVal;
    setQueryParams(updated);

    try {
      const urlObj = new URL(inputUrl);
      urlObj.search = '';
      updated.forEach((p) => {
        if (p.key.trim()) {
          urlObj.searchParams.append(p.key.trim(), p.value);
        }
      });
      setInputUrl(urlObj.toString());
    } catch {
      // ignore
    }
  };

  const addParam = () => {
    const updated = [...queryParams, { key: 'new_param', value: 'value' }];
    setQueryParams(updated);
    try {
      const urlObj = new URL(inputUrl);
      urlObj.searchParams.append('new_param', 'value');
      setInputUrl(urlObj.toString());
    } catch {}
  };

  const removeParam = (index: number) => {
    const updated = queryParams.filter((_, i) => i !== idxToRemove(index));
    setQueryParams(updated);
    try {
      const urlObj = new URL(inputUrl);
      urlObj.search = '';
      updated.forEach((p) => {
        if (p.key.trim()) {
          urlObj.searchParams.append(p.key.trim(), p.value);
        }
      });
      setInputUrl(urlObj.toString());
    } catch {}
  };

  const idxToRemove = (index: number) => index;

  const handleEncode = () => {
    if (encodeMode === 'component') {
      setInputUrl(encodeURIComponent(inputUrl));
    } else {
      setInputUrl(encodeURI(inputUrl));
    }
  };

  const handleDecode = () => {
    try {
      setInputUrl(decodeURIComponent(inputUrl));
    } catch {
      setInputUrl(decodeURI(inputUrl));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inputUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Main URL Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Target URL or String
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEncode}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Encode ({encodeMode === 'component' ? 'Component' : 'Full URL'})
            </button>
            <button
              onClick={handleDecode}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors"
            >
              Decode
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Paste your URL here..."
          />
          <button
            onClick={handleCopy}
            className="px-3.5 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white flex items-center gap-1.5 transition-colors shrink-0"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold">Encode mode:</span>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="enc_mode"
              checked={encodeMode === 'component'}
              onChange={() => setEncodeMode('component')}
            />
            <span>encodeURIComponent (Recommended for query values)</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name="enc_mode"
              checked={encodeMode === 'full'}
              onChange={() => setEncodeMode('full')}
            />
            <span>encodeURI (Preserves :// and ?)</span>
          </label>
        </div>
      </div>

      {/* Visual Component Breakdown */}
      {parsedHost && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Protocol</span>
            <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{parsedProtocol}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Host / Domain</span>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-slate-100">{parsedHost}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 block uppercase">Pathname</span>
            <span className="text-sm font-mono font-bold text-teal-600 dark:text-teal-400">{parsedPath}</span>
          </div>
        </div>
      )}

      {/* Interactive Query Parameters Table */}
      {queryParams.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Query Parameters ({queryParams.length})
            </h3>
            <button
              onClick={addParam}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add Param
            </button>
          </div>

          <div className="space-y-2">
            {queryParams.map((param, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => updateParam(idx, 'key', e.target.value)}
                  placeholder="Key"
                  className="w-1/3 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-semibold"
                />
                <span className="text-slate-400 font-bold">=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => updateParam(idx, 'value', e.target.value)}
                  placeholder="Value"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
                <button
                  onClick={() => removeParam(idx)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
