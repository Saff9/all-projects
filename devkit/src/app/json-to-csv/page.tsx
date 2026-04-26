'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';
import { Copy, Check, Download } from 'lucide-react';

export default function JsonToCsv() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [flatten, setFlatten] = useState(true);
  const [delimiter, setDelimiter] = useState(',');

  const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
      } else if (Array.isArray(value)) {
        result[newKey] = JSON.stringify(value);
      } else {
        result[newKey] = value;
      }
    }
    
    return result;
  };

  const convertToCsv = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }
      
      const parsed = JSON.parse(input);
      
      if (!Array.isArray(parsed)) {
        setError('Input must be an array of objects');
        setOutput('');
        return;
      }
      
      if (parsed.length === 0) {
        setOutput('');
        setError('');
        return;
      }
      
      const processed = flatten ? parsed.map(item => flattenObject(item as Record<string, unknown>)) : parsed;
      
      const allKeys = new Set<string>();
      processed.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach((key) => allKeys.add(key));
        }
      });
      
      const headers = Array.from(allKeys);
      
      const escape = (value: unknown): string => {
        const str = String(value ?? '');
        if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      
      const rows: string[] = [];
      rows.push(headers.map(escape).join(delimiter));
      
      processed.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          const row = headers.map((key) => {
            const value = (item as Record<string, unknown>)[key];
            return escape(value);
          });
          rows.push(row.join(delimiter));
        }
      });
      
      setOutput(rows.join('\n'));
      setError('');
    } catch (err) {
      setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setOutput('');
    }
  }, [input, flatten, delimiter]);

  const downloadCsv = useCallback(() => {
    if (!output) return;
    
    const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.csv';
    link.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          JSON to CSV
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Convert JSON arrays to CSV format for spreadsheet applications.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={convertToCsv}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Convert to CSV
        </button>
        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white cursor-pointer">
          <input
            type="checkbox"
            checked={flatten}
            onChange={(e) => setFlatten(e.target.checked)}
            className="w-4 h-4"
          />
          Flatten nested objects
        </label>
        <select
          value={delimiter}
          onChange={(e) => setDelimiter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value=",">Comma (,)</option>
          <option value=";">Semicolon (;)</option>
          <option value="	">Tab</option>
          <option value="|">Pipe (|)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Input JSON (Array of Objects)"
          value={input}
          onChange={setInput}
          placeholder='[{"name": "John", "age": 30}, ...]'
          error={error}
          rows={16}
        />
        <div className="relative">
          <TextArea
            label="Output CSV"
            value={output}
            onChange={setOutput}
            placeholder="CSV output will appear here..."
            readOnly
            rows={16}
          />
          {output && (
            <div className="flex gap-2 absolute top-9 right-4">
              <button
                onClick={copyToClipboard}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
              <button
                onClick={downloadCsv}
                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Download CSV"
              >
                <Download className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
