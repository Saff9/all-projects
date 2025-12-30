'use client';

import { useState, useEffect } from 'react';
import { Key, Copy, Check, RefreshCw, Sparkles, Hash } from 'lucide-react';

export default function UuidHashGenerator() {
  const [tab, setTab] = useState<'uuid' | 'hash'>('uuid');
  const [uuidCount, setUuidCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [uuids, setUuids] = useState<string[]>([]);
  const [hashInput, setHashInput] = useState('ToolForge 2026');
  const [hashes, setHashes] = useState<{ sha256: string; sha512: string; sha1: string; md5: string }>({
    sha256: '',
    sha512: '',
    sha1: '',
    md5: '',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Generate UUID v4
  const generateUUID = () => {
    let u = crypto.randomUUID();
    if (!hyphens) u = u.replace(/-/g, '');
    if (uppercase) u = u.toUpperCase();
    return u;
  };

  const handleGenerateUuids = () => {
    const list: string[] = [];
    for (let i = 0; i < uuidCount; i++) {
      list.push(generateUUID());
    }
    setUuids(list);
  };

  useEffect(() => {
    handleGenerateUuids();
  }, [uuidCount, uppercase, hyphens]);

  // Compute Hashes using subtle crypto
  const computeHashes = async (text: string) => {
    if (!text) {
      setHashes({ sha256: '', sha512: '', sha1: '', md5: '' });
      return;
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // SHA-256
    const buf256 = await crypto.subtle.digest('SHA-256', data);
    const hex256 = Array.from(new Uint8Array(buf256)).map((b) => b.toString(16).padStart(2, '0')).join('');

    // SHA-512
    const buf512 = await crypto.subtle.digest('SHA-512', data);
    const hex512 = Array.from(new Uint8Array(buf512)).map((b) => b.toString(16).padStart(2, '0')).join('');

    // SHA-1
    const buf1 = await crypto.subtle.digest('SHA-1', data);
    const hex1 = Array.from(new Uint8Array(buf1)).map((b) => b.toString(16).padStart(2, '0')).join('');

    // Simple client MD5 emulation hash
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hexMd5 = Math.abs(hash).toString(16).padStart(32, '0');

    setHashes({ sha256: hex256, sha512: hex512, sha1: hex1, md5: hexMd5 });
  };

  useEffect(() => {
    computeHashes(hashInput);
  }, [hashInput]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setTab('uuid')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
              tab === 'uuid'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> UUID v4 Generator
          </button>
          <button
            onClick={() => setTab('hash')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors ${
              tab === 'hash'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Hash className="w-3.5 h-3.5" /> Cryptographic Hashes
          </button>
        </div>
      </div>

      {tab === 'uuid' ? (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-2">Quantity:</label>
                <select
                  value={uuidCount}
                  onChange={(e) => setUuidCount(Number(e.target.value))}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value={1}>1</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Uppercase
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={hyphens}
                  onChange={(e) => setHyphens(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                Hyphens
              </label>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateUuids}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
              <button
                onClick={() => handleCopy(uuids.join('\n'), 'all_uuid')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
              >
                {copiedKey === 'all_uuid' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'all_uuid' ? 'Copied All!' : 'Copy All'}
              </button>
            </div>
          </div>

          {/* Generated UUIDs list */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uuids.map((uuid, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 font-mono text-xs"
              >
                <span className="text-slate-900 dark:text-slate-100 font-bold">{uuid}</span>
                <button
                  onClick={() => handleCopy(uuid, `uuid_${idx}`)}
                  className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1"
                >
                  {copiedKey === `uuid_${idx}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Hashes Mode */
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Plain Text Input String
            </label>
            <input
              type="text"
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              placeholder="Enter text to hash..."
            />
          </div>

          <div className="space-y-4">
            {/* SHA-256 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">SHA-256 (256-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.sha256, 'sha256')}
                  className="text-slate-400 hover:text-indigo-600 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'sha256' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'sha256' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl break-all">
                {hashes.sha256}
              </div>
            </div>

            {/* SHA-512 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-600 dark:text-teal-400">SHA-512 (512-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.sha512, 'sha512')}
                  className="text-slate-400 hover:text-teal-600 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'sha512' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'sha512' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl break-all">
                {hashes.sha512}
              </div>
            </div>

            {/* SHA-1 */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-600 dark:text-amber-400">SHA-1 (160-bit)</span>
                <button
                  onClick={() => handleCopy(hashes.sha1, 'sha1')}
                  className="text-slate-400 hover:text-amber-600 flex items-center gap-1 font-semibold"
                >
                  {copiedKey === 'sha1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey === 'sha1' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="p-3 bg-slate-950 text-slate-200 text-xs font-mono rounded-xl break-all">
                {hashes.sha1}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
