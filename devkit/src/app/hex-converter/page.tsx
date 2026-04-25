'use client';

import { useState, useCallback } from 'react';

function textToHex(text: string): string {
  let hex = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    hex += charCode.toString(16).padStart(2, '0');
  }
  return hex;
}

function hexToText(hex: string): string {
  // Remove spaces and validate hex
  const cleanHex = hex.replace(/\s+/g, '');
  
  if (!/^[0-9A-Fa-f]+$/.test(cleanHex)) {
    throw new Error('Invalid hex string');
  }

  let text = '';
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.substr(i, 2), 16);
    text += String.fromCharCode(byte);
  }
  return text;
}

export default function HexConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState<string | null>(null);
  const [separator, setSeparator] = useState<'none' | 'space' | 'comma'>('none');

  const convert = useCallback(() => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        let hex = textToHex(input);
        if (separator === 'space') {
          hex = hex.match(/.{1,2}/g)?.join(' ') || hex;
        } else if (separator === 'comma') {
          hex = hex.match(/.{1,2}/g)?.join(',') || hex;
        }
        setOutput(hex);
      } else {
        setOutput(hexToText(input));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion error');
      setOutput('');
    }
  }, [input, mode, separator]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const swapMode = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output);
    setOutput('');
    setError(null);
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      convert();
    } catch {
      setError('Failed to read from clipboard');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Hex Converter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert text to hexadecimal and vice versa.
        </p>
      </div>

      <div className="space-y-6">
        {/* Mode Selection */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => { setMode('encode'); convert(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Text → Hex
            </button>
            <button
              onClick={() => { setMode('decode'); convert(); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Hex → Text
            </button>
          </div>

          {mode === 'encode' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Separator:</span>
              <select
                value={separator}
                onChange={(e) => { setSeparator(e.target.value as typeof separator); convert(); }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="none">None</option>
                <option value="space">Space</option>
                <option value="comma">Comma</option>
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'encode' ? 'Input Text' : 'Hex Input'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={pasteFromClipboard}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Paste
                </button>
                <button
                  onClick={() => { setInput(''); setOutput(''); setError(null); }}
                  className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <textarea
              value={input}
              onChange={(e) => { setInput(e.target.value); convert(); }}
              placeholder={mode === 'encode' ? 'Enter text to convert...' : 'Enter hex to convert...'}
              className="w-full h-48 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white resize-none font-mono text-sm"
            />
            {error && mode === 'decode' && (
              <p className="text-xs text-red-500 mt-2">{error}</p>
            )}
          </div>

          {/* Output */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {mode === 'encode' ? 'Hex Output' : 'Decoded Text'}
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
                {output || 'Output will appear here...'}
              </code>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Encoding Info</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Input length:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{input.length} characters</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Output length:</span>
              <span className="ml-2 text-gray-900 dark:text-white">{output.length} characters</span>
            </div>
            {mode === 'encode' && input && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Hex bytes:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{Math.ceil(input.length / 2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
