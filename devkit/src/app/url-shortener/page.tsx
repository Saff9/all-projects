'use client';

import { useState, useCallback } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import { sanitizeUrl, generateSecureRandom } from '@/utils/security';
import { Link, Copy, Check, RefreshCw, ArrowRight } from 'lucide-react';

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function base62Encode(num: number): string {
  if (num === 0) return BASE62_CHARS[0];
  let encoded = '';
  let n = num;
  while (n > 0) {
    encoded = BASE62_CHARS[n % 62] + encoded;
    n = Math.floor(n / 62);
  }
  return encoded;
}

function base62Decode(str: string): number {
  let decoded = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const val = BASE62_CHARS.indexOf(char);
    decoded = decoded * 62 + val;
  }
  return decoded;
}

export default function UrlShortener() {
  const [longUrl, setLongUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [decodedUrl, setDecodedUrl] = useState('');
  const [mode, setMode] = useState<'shorten' | 'expand'>('shorten');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const shortenUrl = useCallback(() => {
    setError('');
    
    if (!longUrl.trim()) {
      setError('Please enter a URL');
      return;
    }

    const sanitized = sanitizeUrl(longUrl);
    if (!sanitized) {
      setError('Invalid URL');
      return;
    }

    // Generate short code
    const code = customCode.trim() || generateSecureRandom(6, BASE62_CHARS);
    setShortCode(code);
    
    // In a real app, this would be stored in a database
    // For demo, we show the short code that would be used
    setShortenedUrl(`https://devkit.app/${code}`);
  }, [longUrl, customCode]);

  const expandUrl = useCallback(() => {
    setError('');
    
    if (!shortCode.trim()) {
      setError('Please enter a short code');
      return;
    }

    // Validate short code (base62 only)
    const validChars = new Set(BASE62_CHARS);
    if (!shortCode.split('').every(c => validChars.has(c))) {
      setError('Invalid short code. Only alphanumeric characters allowed.');
      return;
    }

    // In a real app, this would look up the URL in a database
    // For demo, we show a placeholder
    setDecodedUrl('https://example.com/very/long/url/path');
  }, [shortCode]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateRandomCode = () => {
    setCustomCode(generateSecureRandom(6, BASE62_CHARS));
  };

  const encodeToBase62 = () => {
    if (!longUrl.trim()) {
      setError('Please enter text to encode');
      return;
    }
    
    // Convert URL to numeric hash, then to base62
    let hash = 0;
    for (let i = 0; i < longUrl.length; i++) {
      const char = longUrl.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    setShortCode(base62Encode(Math.abs(hash)));
    setShortenedUrl(base62Encode(Math.abs(hash)));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Link className="w-8 h-8 text-green-400" />
            URL Shortener
          </h1>
          <p className="text-gray-400">
            Encode URLs to Base62 short codes
          </p>
        </div>
        <BackButton />
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('shorten')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'shorten'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Encode (URL to Base62)
        </button>
        <button
          onClick={() => setMode('expand')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'expand'
              ? 'bg-blue-600 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
          }`}
        >
          Decode (Base62 to URL)
        </button>
      </div>

      <div className="glass rounded-xl p-6">
        {/* Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-zinc-400 mb-2">
            {mode === 'shorten' ? 'Long URL' : 'Base62 Code'}
          </label>
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder={mode === 'shorten' ? 'https://example.com/very/long/url/path' : 'Enter base62 code (e.g., 3K4d9Z)'}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Custom Code (only for shorten mode) */}
        {mode === 'shorten' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Custom Code (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value.replace(/[^0-9A-Za-z]/g, ''))}
                placeholder="Enter custom code"
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                maxLength={20}
              />
              <button
                onClick={generateRandomCode}
                className="px-4 py-3 bg-zinc-700 text-white rounded-lg hover:bg-zinc-600 transition-colors"
                title="Generate random code"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={mode === 'shorten' ? encodeToBase62 : expandUrl}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          {mode === 'shorten' ? 'Generate Short Code' : 'Decode URL'}
        </button>

        {/* Result */}
        {shortCode && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              {mode === 'shorten' ? 'Short Code' : 'Decoded URL'}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={shortCode}
                readOnly
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono"
              />
              <button
                onClick={() => copyToClipboard(shortCode)}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Example URLs */}
        <div className="mt-6 pt-6 border-t border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">Example Codes</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">https://example.com →</span>
              <code className="text-blue-400">2v6K8m</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">https://devkit.app →</span>
              <code className="text-blue-400">3x9L2n</code>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Long URL →</span>
              <code className="text-blue-400">1a2b3c</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
