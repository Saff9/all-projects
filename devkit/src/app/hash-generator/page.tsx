'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import TextArea from '@/components/TextArea';

// Simple hash implementations for client-side use
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha1(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha512(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// HMAC implementation
async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple MD5 implementation
function md5(message: string): string {
  const K: number[] = [];
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 4294967296);
  }

  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;

  const msg = message;
  const msgLen = msg.length;
  
  const bytes: number[] = [];
  for (let i = 0; i < msgLen; i++) {
    bytes.push(msg.charCodeAt(i));
  }
  
  bytes.push(0x80);
  while ((bytes.length % 64) !== 56) {
    bytes.push(0);
  }
  
  const bitLen = msgLen * 8;
  for (let i = 0; i < 8; i++) {
    bytes.push((bitLen >>> (i * 8)) & 0xFF);
  }

  for (let i = 0; i < bytes.length; i += 64) {
    const w: number[] = [];
    for (let j = 0; j < 16; j++) {
      w[j] = (bytes[i + j * 4] || 0) | 
             ((bytes[i + j * 4 + 1] || 0) << 8) | 
             ((bytes[i + j * 4 + 2] || 0) << 16) | 
             ((bytes[i + j * 4 + 3] || 0) << 24);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;

    for (let j = 0; j < 64; j++) {
      let f: number, g: number;
      if (j < 16) {
        f = (b & c) | ((~b) & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | ((~d) & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | (~d));
        g = (7 * j) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      b = b + leftRotate((a + f + K[j] + w[g]) | 0, [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21][Math.floor(j / 16) * 4 + j % 4]);
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
  }

  function leftRotate(x: number, c: number): number {
    return ((x << c) | (x >>> (32 - c))) | 0;
  }

  const toHex = (n: number) => {
    return [(n & 0xFF), (n >> 8) & 0xFF, (n >> 16) & 0xFF, (n >> 24) & 0xFF]
      .map(b => (b >>> 0).toString(16).padStart(2, '0'))
      .join('');
  };

  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({
    md5: '',
    sha1: '',
    sha256: '',
    sha512: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHashes, setSelectedHashes] = useState({
    md5: true,
    sha1: true,
    sha256: true,
    sha512: false,
  });
  const [hmacSecret, setHmacSecret] = useState('');
  const [hmacHash, setHmacHash] = useState('');
  const [compareHash, setCompareHash] = useState('');
  const [compareResult, setCompareResult] = useState<{ match: boolean; hash: string } | null>(null);
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'text' | 'file' | 'hmac' | 'compare'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateHashes = useCallback(async () => {
    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      setHmacHash('');
      return;
    }

    setIsLoading(true);

    const results: { md5?: string; sha1?: string; sha256?: string; sha512?: string } = {};

    if (selectedHashes.md5) {
      results.md5 = md5(input);
    }
    if (selectedHashes.sha1) {
      results.sha1 = await sha1(input);
    }
    if (selectedHashes.sha256) {
      results.sha256 = await sha256(input);
    }
    if (selectedHashes.sha512) {
      results.sha512 = await sha512(input);
    }

    setHashes({
      md5: results.md5 || '',
      sha1: results.sha1 || '',
      sha256: results.sha256 || '',
      sha512: results.sha512 || '',
    });

    // Generate HMAC if secret is provided
    if (hmacSecret) {
      setHmacHash(await hmacSha256(input, hmacSecret));
    }

    setIsLoading(false);
  }, [input, selectedHashes, hmacSecret]);

  // Generate hashes for file
  const generateFileHash = useCallback(async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    setFileHash(hash);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    generateHashes();
  }, [generateHashes]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      generateFileHash(file);
      setActiveTab('file');
    }
  }, [generateFileHash]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      generateFileHash(file);
      setActiveTab('file');
    }
  };

  const toggleHash = (hash: keyof typeof selectedHashes) => {
    setSelectedHashes(prev => ({ ...prev, [hash]: !prev[hash] }));
  };

  const compareHashes = () => {
    const targetHash = Object.values(hashes).find(h => h) || '';
    if (!targetHash || !compareHash) {
      setCompareResult(null);
      return;
    }
    setCompareResult({
      match: targetHash.toLowerCase() === compareHash.toLowerCase(),
      hash: targetHash
    });
  };

  useEffect(() => {
    compareHashes();
  }, [compareHash, hashes]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hash Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate MD5, SHA1, SHA256, and SHA512 hashes from text or files.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'text'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'file'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          File
        </button>
        <button
          onClick={() => setActiveTab('hmac')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'hmac'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          HMAC
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'compare'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Compare
        </button>
      </div>

      {activeTab === 'text' && (
        <>
          {/* Hash Selection */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.keys(selectedHashes).map(hash => (
              <button
                key={hash}
                onClick={() => toggleHash(hash as keyof typeof selectedHashes)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedHashes[hash as keyof typeof selectedHashes]
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {hash.toUpperCase()}
              </button>
            ))}
          </div>

          <TextArea
            label="Input Text"
            value={input}
            onChange={setInput}
            placeholder="Enter text to hash..."
            rows={8}
          />

          {isLoading && (
            <div className="mt-4 text-center text-gray-600 dark:text-gray-400">
              Generating hashes...
            </div>
          )}

          {/* Hash Results */}
          {Object.entries(hashes).map(([algo, hash]) => (
            selectedHashes[algo as keyof typeof selectedHashes] && hash && (
              <div key={algo} className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {algo.toUpperCase()} Hash
                  </label>
                  <button
                    onClick={() => copyToClipboard(hash)}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all text-gray-900 dark:text-white">
                  {hash}
                </div>
              </div>
            )
          ))}
        </>
      )}

      {activeTab === 'file' && (
        <>
          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`p-12 rounded-xl border-2 border-dashed transition-colors text-center ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop a file here to generate its SHA256 hash
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Select File
            </button>
          </div>

          {isLoading && (
            <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
              Calculating file hash...
            </div>
          )}

          {fileHash && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    File
                  </label>
                  <p className="text-xs text-gray-500">{fileName}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(fileHash)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all text-gray-900 dark:text-white">
                {fileHash}
              </div>
            </div>
          )}

          {/* Demo hash lookup (simulated) */}
          <div className="mt-6 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-2">
              🔍 Hash Lookup (Demo)
            </h3>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-4">
              Enter a hash to check if it matches known malware signatures (simulated database).
            </p>
            <input
              type="text"
              value={compareHash}
              onChange={(e) => setCompareHash(e.target.value)}
              placeholder="Enter hash to lookup..."
              className="w-full px-4 py-2 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
            />
            {compareHash && (
              <div className="mt-4 text-sm">
                {fileHash && compareHash.toLowerCase() === fileHash.toLowerCase() ? (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="text-xl">⚠️</span>
                    <span>Warning: This file hash was found in our simulated malware database!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span className="text-xl">✓</span>
                    <span>No match found in simulated database.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'hmac' && (
        <>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HMAC Secret Key
            </label>
            <input
              type="text"
              value={hmacSecret}
              onChange={(e) => setHmacSecret(e.target.value)}
              placeholder="Enter your secret key..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <TextArea
            label="Message"
            value={input}
            onChange={setInput}
            placeholder="Enter message to sign..."
            rows={8}
          />

          {hmacHash && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  HMAC-SHA256 Signature
                </label>
                <button
                  onClick={() => copyToClipboard(hmacHash)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Copy
                </button>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg font-mono text-sm break-all text-gray-900 dark:text-white">
                {hmacHash}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'compare' && (
        <>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hash to Compare
            </label>
            <input
              type="text"
              value={compareHash}
              onChange={(e) => setCompareHash(e.target.value)}
              placeholder="Enter hash to compare..."
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
            />
          </div>

          <TextArea
            label="Generated Hash (from text input)"
            value={hashes.sha256 || hashes.md5 || hashes.sha1 || ''}
            onChange={() => {}}
            placeholder="Generate a hash from the Text tab first..."
            rows={4}
            readOnly
          />

          {compareHash && (
            <div className="mt-6 p-6 rounded-xl border-2 text-center">
              {compareResult?.match ? (
                <div className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="text-4xl mb-2">✓</div>
                  <div className="text-green-800 dark:text-green-400 font-semibold">Hashes Match!</div>
                </div>
              ) : compareResult ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-xl p-6">
                  <div className="text-4xl mb-2">✗</div>
                  <div className="text-red-800 dark:text-red-400 font-semibold">Hashes Do Not Match</div>
                </div>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
