'use client';

import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

const detectCase = (text: string): string => {
  if (!text) return 'Empty';
  if (/^[A-Z]+$/.test(text)) return 'UPPER CASE';
  if (/^[a-z]+$/.test(text)) return 'lowercase';
  if (/^[A-Z][a-z]+$/.test(text)) return 'PascalCase';
  if (/^[a-z]+[A-Z]/.test(text)) return 'camelCase';
  if (/^[a-z]+_[a-z]+$/.test(text)) return 'snake_case';
  if (/^[A-Z]+_[A-Z]+$/.test(text)) return 'SCREAMING_SNAKE_CASE';
  if (/^[a-z]+-[a-z]+$/.test(text)) return 'kebab-case';
  if (/^[A-Z]+-[A-Z]+$/.test(text)) return 'KEBAB-CASE';
  if (/^[\w]+$/.test(text)) return 'Mixed alphanumeric';
  return 'Unknown';
};

const toCamelCase = (str: string): string => {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase());
};

const toPascalCase = (str: string): string => {
  return str.replace(/[-_](.)/g, (_, c) => c.toUpperCase()).replace(/^./, (c) => c.toUpperCase());
};

const toSnakeCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
};

const toKebabCase = (str: string): string => {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
};

const toUpperCase = (str: string): string => {
  return str.toUpperCase();
};

const toLowerCase = (str: string): string => {
  return str.toLowerCase();
};

const toTitleCase = (str: string): string => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

const toConstantCase = (str: string): string => {
  return toSnakeCase(str).toUpperCase();
};

const toSentenceCase = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

interface Conversions {
  [key: string]: string;
}

export default function CaseTester() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const stats = {
    length: input.length,
    words: input.trim() ? input.trim().split(/\s+/).length : 0,
    characters: input.length,
    lines: input.split('\n').length,
  };

  const conversions: Conversions = {
    camelCase: toCamelCase(input),
    PascalCase: toPascalCase(input),
    snake_case: toSnakeCase(input),
    kebabCase: toKebabCase(input),
    UPPERCASE: toUpperCase(input),
    lowercase: toLowerCase(input),
    TitleCase: toTitleCase(input),
    CONSTANTCASE: toConstantCase(input),
    SentenceCase: toSentenceCase(input),
  };

  const detected = detectCase(input);

  const copyToClipboard = useCallback((key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Text Case Tester
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test text against different case formats and convert between them.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">Characters</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.characters}</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.words}</p>
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">Lines</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lines}</p>
        </div>
        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-400">Detected Case</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{detected}</p>
        </div>
      </div>

      {/* Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter or paste your text here..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>

      {/* Conversions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(conversions).map(([name, value]) => (
          <div key={name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {name}
              </label>
              <button
                onClick={() => copyToClipboard(name, value)}
                className="p-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Copy to clipboard"
              >
                {copied === name ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <code className="text-sm text-gray-700 dark:text-gray-300 break-all">
                {value || <span className="text-gray-400 italic">Enter text to convert</span>}
              </code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
