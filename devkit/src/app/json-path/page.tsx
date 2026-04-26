'use client';

import { useState, useCallback } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import TextArea from '@/components/TextArea';
import { sanitizeJson } from '@/utils/security';
import { Search, Check, X, AlertCircle, Code, Play, History } from 'lucide-react';

// Simple JSONPath implementation (subset of full spec)
function jsonPathQuery(obj: unknown, path: string): unknown[] {
  const results: unknown[] = [];
  
  // Normalize path
  const normalizedPath = path.replace(/^\$\.?/, ''); // Remove leading $ or $.
  
  if (!normalizedPath) {
    return [obj];
  }
  
  const parts = normalizedPath.split(/\.|\[|\]/).filter(Boolean);
  
  function traverse(current: unknown, depth: number): void {
    if (depth === parts.length) {
      results.push(current);
      return;
    }
    
    const part = parts[depth];
    
    if (current === null || current === undefined) return;
    
    if (Array.isArray(current)) {
      if (part === '*') {
        current.forEach(item => traverse(item, depth + 1));
      } else if (part === '..') {
        traverse(current, depth + 1);
      } else if (!isNaN(parseInt(part))) {
        const index = parseInt(part);
        if (index >= 0 && index < current.length) {
          traverse(current[index], depth + 1);
        }
      } else {
        // Array filter like [?(condition)]
        if (part.startsWith('?(')) {
          const condition = part.slice(2, -1);
          // Simple equality check
          const match = condition.match(/@\.(\w+)\s*==\s*['"]?(\w+)['"]?/);
          if (match) {
            const [, key, value] = match;
            current.filter(item => {
              if (typeof item === 'object' && item !== null) {
                return (item as Record<string, unknown>)[key] === value;
              }
              return false;
            }).forEach(item => traverse(item, depth + 1));
          }
        } else {
          current.forEach(item => traverse(item, depth + 1));
        }
      }
    } else if (typeof current === 'object') {
      const obj = current as Record<string, unknown>;
      
      if (part === '*') {
        Object.values(obj).forEach(value => traverse(value, depth + 1));
      } else if (part === '..') {
        // Recursive descent
        function searchDeep(value: unknown): void {
          if (typeof value === 'object' && value !== null) {
            if (parts[depth + 1] === undefined || parts[depth + 1] === '*') {
              results.push(value);
            }
            Object.values(value as Record<string, unknown>).forEach(searchDeep);
          }
        }
        searchDeep(current);
      } else if (part in obj) {
        traverse(obj[part], depth + 1);
      }
    }
  }
  
  traverse(obj, 0);
  return results;
}

// Sample JSON data
const SAMPLE_JSON = {
  store: {
    book: [
      { category: "reference", author: "Nigel Rees", title: "Sayings of the Century", price: 8.95 },
      { category: "fiction", author: "Evelyn Waugh", title: "Sword of Honour", price: 12.99 },
      { category: "fiction", author: "Herman Melville", title: "Moby Dick", price: 8.99 },
      { category: "fiction", author: "J.R.R. Tolkien", title: "The Lord of the Rings", price: 22.99 }
    ],
    bicycle: {
      color: "red",
      price: 19.95,
      brand: "Trek"
    }
  },
  expensive: 10
};

export default function JsonPathTester() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_JSON, null, 2));
  const [path, setPath] = useState('$.store.book[*].author');
  const [result, setResult] = useState<unknown>('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [matchCount, setMatchCount] = useState(0);

  const executeQuery = useCallback(() => {
    setError('');
    setResult(null);
    
    try {
      const parsed = JSON.parse(sanitizeJson(jsonInput));
      const results = jsonPathQuery(parsed, path);
      setMatchCount(results.length);
      
      if (results.length === 0) {
        setResult('No matches found');
      } else if (results.length === 1) {
        setResult(results[0]);
      } else {
        setResult(results);
      }
      
      // Add to history
      setHistory(prev => [path, ...prev.filter(p => p !== path)].slice(0, 10));
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setResult(null);
    }
  }, [jsonInput, path]);

  const loadSample = () => {
    setJsonInput(JSON.stringify(SAMPLE_JSON, null, 2));
    setPath('$.store.book[*].author');
  };

  const quickPaths = [
    { label: 'All books', path: '$.store.book[*]' },
    { label: 'All authors', path: '$.store.book[*].author' },
    { label: 'Prices', path: '$.store.book[*].price' },
    { label: 'Red items', path: "$..*[?(@.color=='red')]" },
    { label: 'Fiction books', path: "$.store.book[?(@.category=='fiction')]" },
    { label: 'Books under $10', path: "$.store.book[?(@.price<10)]" },
    { label: 'Bicycle info', path: '$.store.bicycle' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Search className="w-8 h-8 text-cyan-400" />
            JSONPath Tester
          </h1>
          <p className="text-gray-400">
            Test JSONPath expressions against JSON data
          </p>
        </div>
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Paths & History */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
              <Code className="w-4 h-4" />
              Quick Paths
            </h3>
            <div className="space-y-2">
              {quickPaths.map((qp) => (
                <button
                  key={qp.path}
                  onClick={() => setPath(qp.path)}
                  className="w-full text-left px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors"
                >
                  <span className="text-white block">{qp.label}</span>
                  <code className="text-xs text-zinc-500">{qp.path}</code>
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </h3>
              <div className="space-y-1">
                {history.map((h, i) => (
                  <button
                    key={i}
                    onClick={() => setPath(h)}
                    className="w-full text-left px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs text-zinc-400 transition-colors truncate"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Middle Column - Path Input & JSON */}
        <div className="lg:col-span-2 space-y-6">
          {/* Path Input */}
          <div className="glass rounded-xl p-4">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              JSONPath Expression
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeQuery()}
                placeholder="$.store.book[*].author"
                className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={executeQuery}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>

          {/* JSON Input */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-zinc-400">JSON Data</label>
              <button
                onClick={loadSample}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Load Sample
              </button>
            </div>
            <TextArea
              value={jsonInput}
              onChange={(val) => setJsonInput(val)}
              placeholder="Paste your JSON here..."
              rows={12}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Results</h3>
          {result !== null && result !== undefined && (
            <span className="text-sm text-zinc-400">
              {matchCount} match{matchCount !== 1 ? 'es' : ''} found
            </span>
          )}
        </div>

        {result === null || result === undefined ? (
          <div className="text-center py-12 text-zinc-500">
            Enter a JSONPath expression and click "Run" to see results
          </div>
        ) : typeof result === 'string' && result === 'No matches found' ? (
          <div className="flex items-center gap-2 text-yellow-400">
            <Search className="w-5 h-5" />
            <span>{result}</span>
          </div>
        ) : (
          <div className="relative">
            <pre className="p-4 bg-zinc-900 rounded-lg overflow-x-auto text-sm">
              <code className="text-green-400 font-mono">
                {typeof result === 'string' 
                  ? result 
                  : JSON.stringify(result, null, 2)}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Syntax Reference */}
      <div className="mt-6 glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">JSONPath Syntax Reference</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-blue-400">$</code>
              <span className="text-zinc-400">Root element</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-blue-400">@</code>
              <span className="text-zinc-400">Current element</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-blue-400">*</code>
              <span className="text-zinc-400">Wildcard</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-blue-400">..</code>
              <span className="text-zinc-400">Recursive descent</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="text-blue-400">.key</code>
              <span className="text-zinc-400">Child element</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-blue-400">['key']</code>
              <span className="text-zinc-400">Subscript notation</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-blue-400">[?(@.key)]</code>
              <span className="text-zinc-400">Filter expression</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-blue-400">[0,1]</code>
              <span className="text-zinc-400">Multiple indices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
