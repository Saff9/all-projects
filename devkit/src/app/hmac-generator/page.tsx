'use client';

import { useState, useCallback } from 'react';

type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512';

async function generateHMAC(
  message: string,
  secret: string,
  algorithm: HashAlgorithm
): Promise<{ hex: string; base64: string }> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  let algorithmName: string;
  switch (algorithm) {
    case 'MD5':
      algorithmName = 'HMAC';
      break;
    case 'SHA1':
      algorithmName = 'HMAC';
      break;
    case 'SHA256':
      algorithmName = 'HMAC';
      break;
    case 'SHA512':
      algorithmName = 'HMAC';
      break;
    default:
      algorithmName = 'HMAC';
  }

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: algorithmName, hash: { name: `SHA-${algorithm.replace('SHA', '')}` } },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(algorithmName, key, messageData);
    const hashArray = Array.from(new Uint8Array(signature));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const base64 = btoa(String.fromCharCode(...hashArray));

    return { hex, base64 };
  } catch {
    // Fallback for algorithms not fully supported
    return { hex: 'Not supported in browser', base64: 'Not supported in browser' };
  }
}

export default function HMACGenerator() {
  const [message, setMessage] = useState('');
  const [secret, setSecret] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA256');
  const [result, setResult] = useState<{ hex: string; base64: string } | null>(null);

  const generate = useCallback(async () => {
    if (!message || !secret) {
      setResult(null);
      return;
    }

    const hmac = await generateHMAC(message, secret, algorithm);
    setResult(hmac);
  }, [message, secret, algorithm]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512'];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          HMAC Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate HMAC signatures with various hash algorithms.
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {ALGORITHMS.map((algo) => (
                <option key={algo} value={algo}>
                  {algo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Secret Key
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); generate(); }}
            placeholder="Enter your secret key..."
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => { setMessage(e.target.value); generate(); }}
            placeholder="Enter the message to sign..."
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          />
        </div>

        {result && (
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  HEX
                </span>
                <button
                  onClick={() => copyToClipboard(result.hex)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Copy
                </button>
              </div>
              <code className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {result.hex}
              </code>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Base64
                </span>
                <button
                  onClick={() => copyToClipboard(result.base64)}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Copy
                </button>
              </div>
              <code className="block p-3 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                {result.base64}
              </code>
            </div>
          </div>
        )}

        {!result && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-xl">
            Enter a message and secret key to generate HMAC signature
          </div>
        )}
      </div>
    </div>
  );
}
