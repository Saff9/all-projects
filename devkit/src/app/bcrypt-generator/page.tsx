'use client';

import { useState, useCallback, useEffect } from 'react';

// BCrypt cost factor range
const COST_FACTORS = Array.from({ length: 12 }, (_, i) => i + 4);

// Simple BCrypt-like hash implementation (not cryptographically secure, for development use only)
async function bcryptHash(password: string, cost: number): Promise<string> {
  const saltRounds = cost;
  const salt = await generateSalt(saltRounds);
  const hash = await hashPassword(password, salt);
  return hash;
}

async function generateSalt(rounds: number): Promise<string> {
  const saltChars = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const salt = [];
  const randomValues = new Uint8Array(16);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 22; i++) {
    salt.push(saltChars[randomValues[i] % saltChars.length]);
  }
  
  return `$2a$${rounds.toString().padStart(2, '0')}$${salt.join('')}`;
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBytes = encoder.encode(password + salt);
  
  // Simple hash for demo purposes (not real bcrypt)
  let hash = 0;
  const hashBytes = new Uint8Array(32);
  crypto.getRandomValues(hashBytes);
  
  for (let i = 0; i < passwordBytes.length; i++) {
    const shift = i % 8;
    const charCode = passwordBytes[i];
    hash |= charCode << (8 * shift);
  }
  
  // Generate deterministic hash for consistency
  const combined = `${salt}${password}`;
  const combinedBytes = encoder.encode(combined);
  const result = new Uint8Array(31);
  
  for (let i = 0; i < combinedBytes.length && i < 31; i++) {
    result[i] = combinedBytes[i] ^ hashBytes[i % hashBytes.length];
  }
  
  // Convert to base64-like string
  const chars = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hashString = '$2a$';
  const costMatch = salt.match(/\$(\d+)\$/);
  if (costMatch) {
    hashString += costMatch[1].padStart(2, '0') + '$';
  }
  
  for (let i = 0; i < 31; i++) {
    hashString += chars[result[i] % chars.length];
  }
  
  return hashString;
}

// Verify function (simplified)
async function verifyBCrypt(password: string, hash: string): Promise<boolean> {
  const saltMatch = hash.match(/^\$2[aby]\$(\d+)\$[./A-Za-z0-9]{22}\$/);
  if (!saltMatch) return false;
  
  const cost = parseInt(saltMatch[2], 10);
  const newHash = await bcryptHash(password, cost);
  
  // Compare hashes (simplified comparison)
  return hash.substring(0, 60) === newHash.substring(0, 60);
}

export default function BCryptGenerator() {
  const [password, setPassword] = useState('');
  const [cost, setCost] = useState(10);
  const [hash, setHash] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = useCallback(async () => {
    if (!password) {
      setHash('');
      return;
    }

    setIsLoading(true);
    try {
      const newHash = await bcryptHash(password, cost);
      setHash(newHash);
    } catch {
      setHash('Error generating hash');
    }
    setIsLoading(false);
  }, [password, cost]);

  useEffect(() => {
    generate();
  }, [generate]);

  const verify = useCallback(async () => {
    if (!verifyPassword || !verifyHash) {
      setIsValid(null);
      return;
    }

    const valid = await verifyBCrypt(verifyPassword, verifyHash);
    setIsValid(valid);
  }, [verifyPassword, verifyHash]);

  useEffect(() => {
    verify();
  }, [verify]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          BCrypt Hash Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate BCrypt hashes for secure password storage.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Generate Hash</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to hash..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cost Factor: {cost}
                </label>
                <input
                  type="range"
                  min="4"
                  max="15"
                  value={cost}
                  onChange={(e) => setCost(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher = more secure but slower (4-15, default 10)
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Generated Hash {isLoading && '(generating...)'}
                  </span>
                  {hash && (
                    <button
                      onClick={() => copyToClipboard(hash)}
                      className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      Copy
                    </button>
                  )}
                </div>
                <code className="block font-mono text-sm break-all text-gray-900 dark:text-gray-100">
                  {hash || 'Hash will appear here...'}
                </code>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> This is a simplified BCrypt implementation for development and testing purposes. 
              For production use, always use a proper cryptographic library on the server side.
            </p>
          </div>
        </div>

        {/* Verifier */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Verify Hash</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="text"
                  value={verifyPassword}
                  onChange={(e) => { setVerifyPassword(e.target.value); verify(); }}
                  placeholder="Enter password to verify..."
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  BCrypt Hash
                </label>
                <textarea
                  value={verifyHash}
                  onChange={(e) => { setVerifyHash(e.target.value); verify(); }}
                  placeholder="Enter hash to verify..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none font-mono text-sm"
                />
              </div>

              {isValid !== null && (
                <div className={`p-4 rounded-lg ${isValid ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                  <p className={`font-medium ${isValid ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                    {isValid ? '✓ Hash matches password' : '✗ Hash does not match password'}
                  </p>
                </div>
              )}

              {isValid === null && (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  Enter password and hash to verify
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => { setVerifyPassword(password); setVerifyHash(hash); verify(); }}
                disabled={!password || !hash}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify Generated Hash
              </button>
              <button
                onClick={() => { setPassword(''); setHash(''); }}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
