'use client';

import { useState } from 'react';
import { Type, Copy, Check, Trash2, Sparkles } from 'lucide-react';

export default function TextCaseConverter() {
  const [text, setText] = useState('Supercharge your search rankings with clean structured data and fast web utilities!');
  const [copied, setCopied] = useState(false);

  // Conversion functions
  const toSentenceCase = (str: string) => {
    return str
      .toLowerCase()
      .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
  };

  const toTitleCase = (str: string) => {
    const minorWords = new Set(['and', 'as', 'but', 'for', 'if', 'nor', 'or', 'so', 'yet', 'a', 'an', 'the', 'at', 'by', 'in', 'of', 'on', 'per', 'to']);
    return str.toLowerCase().replace(/\b\w+/g, (word, index) => {
      if (index > 0 && minorWords.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    });
  };

  const toCamelCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[A-Z]/, (c) => c.toLowerCase());
  };

  const toPascalCase = (str: string) => {
    return str
      .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
      .replace(/^[a-z]/, (c) => c.toUpperCase());
  };

  const toSnakeCase = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  const toKebabCase = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const toConstantCase = (str: string) => {
    return toSnakeCase(str).toUpperCase();
  };

  const toAlternatingCase = (str: string) => {
    return str
      .split('')
      .map((c, i) => (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()))
      .join('');
  };

  const handleConvert = (type: string) => {
    switch (type) {
      case 'sentence':
        setText(toSentenceCase(text));
        break;
      case 'title':
        setText(toTitleCase(text));
        break;
      case 'upper':
        setText(text.toUpperCase());
        break;
      case 'lower':
        setText(text.toLowerCase());
        break;
      case 'camel':
        setText(toCamelCase(text));
        break;
      case 'pascal':
        setText(toPascalCase(text));
        break;
      case 'snake':
        setText(toSnakeCase(text));
        break;
      case 'kebab':
        setText(toKebabCase(text));
        break;
      case 'constant':
        setText(toConstantCase(text));
        break;
      case 'alternating':
        setText(toAlternatingCase(text));
        break;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Transformation Buttons Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Click Any Format to Convert Instantly
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <button
            onClick={() => handleConvert('sentence')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Sentence case
          </button>
          <button
            onClick={() => handleConvert('title')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Title Case (AP)
          </button>
          <button
            onClick={() => handleConvert('upper')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            UPPERCASE
          </button>
          <button
            onClick={() => handleConvert('lower')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            lowercase
          </button>
          <button
            onClick={() => handleConvert('camel')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
          >
            camelCase
          </button>
          <button
            onClick={() => handleConvert('pascal')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
          >
            PascalCase
          </button>
          <button
            onClick={() => handleConvert('snake')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
          >
            snake_case
          </button>
          <button
            onClick={() => handleConvert('kebab')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
          >
            kebab-case
          </button>
          <button
            onClick={() => handleConvert('constant')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
          >
            CONSTANT_CASE
          </button>
          <button
            onClick={() => handleConvert('alternating')}
            className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            aLtErNaTiNg
          </button>
        </div>
      </div>

      {/* Editor & Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>{text.length} characters</span>
            <span>·</span>
            <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setText('')}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
          </div>
        </div>

        <textarea
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here..."
          className="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
