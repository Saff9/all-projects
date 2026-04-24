'use client';

import { useState, useCallback } from 'react';

// Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE32_ALPHABET_LOWERCASE = 'abcdefghijklmnopqrstuvwxyz234567';

function base32Encode(input: string, lowercase: boolean = false): string {
  if (!input) return '';

  const alphabet = lowercase ? BASE32_ALPHABET_LOWERCASE : BASE32_ALPHABET;
  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    
    // Add 8 bits for each character
    value = (value << 8) | charCode;
    bits += 8;

    // Extract 5 bits at a time
    while (bits >= 5) {
      bits -= 5;
      const index = (value >>> bits) & 0x1F;
      result += alphabet[index];
    }
  }

  // Handle remaining bits
  if (bits > 0) {
    const index = (value << (5 - bits)) & 0x1F;
    result += alphabet[index];
  }

  // Add padding
  const paddingLength = (8 - (result.length % 8)) % 8;
  if (paddingLength > 0 && paddingLength < 8) {
    result += '='.repeat(paddingLength);
  }

  return result;
}

function base32Decode(input: string): string {
  if (!input) return '';

  // Normalize input
  let cleanInput = input.trim().toUpperCase().replace(/=+$/, '');
  
  // Validate characters
  const validChars = BASE32_ALPHABET + '=';
  for (const char of cleanInput) {
    if (!validChars.includes(char)) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
  }

  // Remove padding for decoding
  cleanInput = cleanInput.replace(/=+$/, '');

  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleanInput.length; i++) {
    const char = cleanInput[i];
    const charValue = BASE32_ALPHABET.indexOf(char);

    if (charValue === -1) continue;

    value = (value << 5) | charValue;
    bits += 5;

    // Extract 8 bits at a time
    while (bits >= 8) {
      bits -= 8;
      const byte = (value >>> bits) & 0xFF;
      result += String.fromCharCode(byte);
    }
  }

  return result;
}

function isValidBase32(input: string): boolean {
  if (!input) return true;
  
  const cleanInput = input.trim().toUpperCase().replace(/=+$/, '');
  if (cleanInput.length === 0) return true;

  const validChars = BASE32_ALPHABET + '=';
  return [...cleanInput].every(char => validChars.includes(char));
}

export default function Base32Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [lowercase, setLowercase] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    setError(null);
    if (!input) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        setOutput(base32Encode(input, lowercase));
      } else {
        setOutput(base32Decode(input));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input');
      setOutput('');
    }
  }, [input, mode, lowercase]);

  useState(() => {
    convert();
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Base32 Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Encode and decode Base32 strings.
        </p>
      </div>

      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => { setMode('encode'); convert(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => { setMode('decode'); convert(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Decode
            </button>
          </div>

          {mode === 'encode' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lowercase}
                onChange={(e) => { setLowercase(e.target.checked); convert(); }}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Lowercase</span>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'encode' ? 'Plain Text' : 'Base32 Input'}
              </h3>
              <button
                onClick={() => { setInput(''); setOutput(''); setError(null); }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Clear
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); convert(); }}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Enter Base32 to decode...'}
              className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none font-mono text-sm"
            />
            {input && !isValidBase32(input) && mode === 'decode' && (
              <p className="text-xs text-red-500 mt-2">Contains invalid Base32 characters</p>
            )}
          </div>

          {/* Output */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'encode' ? 'Base32 Output' : 'Decoded Text'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={swapMode}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Swap
                </button>
                <button
                  onClick={() => copyToClipboard(output)}
                  disabled={!output}
                  className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors disabled:opacity-50"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="w-full h-48 px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-auto">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                {output || (error ? `Error: ${error}` : 'Output will appear here...')}
              </code>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">About Base32</h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Base32 is a encoding scheme that represents binary data in an ASCII string format. 
            It uses a 32-character alphabet (A-Z, 2-7) and is commonly used in applications 
            where cleartext output is needed and case-insensitivity is desired.
          </p>
        </div>
      </div>
    </div>
  );
}
