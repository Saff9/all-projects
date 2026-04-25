'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

type ConversionMode = 'csv-to-json' | 'json-to-csv';

interface CsvOptions {
  delimiter: string;
  hasHeader: boolean;
}

const detectDelimiter = (line: string): string => {
  const delimiters = [',', ';', '\t', '|'];
  let maxCount = 0;
  let detected = ',';

  for (const d of delimiters) {
    const count = (line.match(new RegExp(d === '|' ? '\\|' : d, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detected = d;
    }
  }

  return detected;
};

const parseLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
};

const parseCSV = (csv: string, delimiter: string, hasHeader: boolean): { data: Record<string, unknown>[], error?: string } => {
  const lines = csv.trim().split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return { data: [] };
  }

  const actualDelimiter = delimiter === 'auto' ? detectDelimiter(lines[0]) : delimiter;
  const result: Record<string, unknown>[] = [];

  let startIndex = 0;
  let headers: string[] = [];

  if (hasHeader) {
    headers = parseLine(lines[0], actualDelimiter);
    startIndex = 1;
  } else {
    headers = Array.from({ length: parseLine(lines[0], actualDelimiter).length }, (_, i) => `column${i + 1}`);
  }

  for (let i = startIndex; i < lines.length; i++) {
    const values = parseLine(lines[i], actualDelimiter);
    const obj: Record<string, unknown> = {};

    headers.forEach((header, idx) => {
      let value = values[idx] || '';
      value = value.trim();
      
      // Try to parse as number
      if (value && !isNaN(Number(value)) && value.trim() !== '') {
        obj[header] = Number(value);
      } else {
        obj[header] = value;
      }
    });

    result.push(obj);
  }

  return { data: result };
};

const convertToCSV = (json: unknown[], delimiter: string): string => {
  if (!Array.isArray(json) || json.length === 0) {
    return '';
  }

  const headers = Object.keys(json[0] as object);
  const rows: string[] = [];

  // Add header row
  rows.push(headers.map(h => `"${h}"`).join(delimiter));

  // Add data rows
  for (const item of json) {
    const row = headers.map(h => {
      const value = (item as Record<string, unknown>)[h];
      if (value === null || value === undefined) {
        return '""';
      }
      const str = String(value);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    });
    rows.push(row.join(delimiter));
  }

  return rows.join('\n');
};

export default function CsvJson() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('csv-to-json');
  const [error, setError] = useState('');
  const [options, setOptions] = useState<CsvOptions>({
    delimiter: ',',
    hasHeader: true,
  });

  const convert = useCallback(() => {
    try {
      if (!input.trim()) {
        setOutput('');
        setError('');
        return;
      }

      if (mode === 'csv-to-json') {
        const result = parseCSV(input, options.delimiter, options.hasHeader);
        if (result.error) {
          setError(result.error);
          setOutput('');
        } else {
          setOutput(JSON.stringify(result.data, null, 2));
          setError('');
        }
      } else {
        const parsed = JSON.parse(input);
        const csv = convertToCSV(parsed, options.delimiter);
        setOutput(csv);
        setError('');
      }
    } catch (err) {
      if (mode === 'csv-to-json') {
        setError(`Invalid CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } else {
        setError(`Invalid JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
      setOutput('');
    }
  }, [input, mode, options]);

  const handleModeChange = (newMode: ConversionMode) => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
  };

  const inputPlaceholder = mode === 'csv-to-json'
    ? `name,age,city\nJohn Doe,30,New York\nJane Smith,25,Los Angeles`
    : `[
  {
    "name": "John Doe",
    "age": 30,
    "city": "New York"
  },
  {
    "name": "Jane Smith",
    "age": 25,
    "city": "Los Angeles"
  }
]`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          CSV / JSON Converter
        </h1>
        <p className="text-gray-400">
          Convert between CSV and JSON formats with customizable options.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as ConversionMode)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="csv-to-json">CSV → JSON</option>
          <option value="json-to-csv">JSON → CSV</option>
        </select>

        {mode === 'csv-to-json' && (
          <>
            <select
              value={options.delimiter}
              onChange={(e) => setOptions(prev => ({ ...prev, delimiter: e.target.value }))}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="auto">Auto-detect delimiter</option>
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
              <input
                type="checkbox"
                checked={options.hasHeader}
                onChange={(e) => setOptions(prev => ({ ...prev, hasHeader: e.target.checked }))}
                className="rounded bg-white/10 border-white/20"
              />
              Has header row
            </label>
          </>
        )}

        <button
          onClick={convert}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                     transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Convert
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label={mode === 'csv-to-json' ? 'CSV Input' : 'JSON Input'}
          value={input}
          onChange={(val) => {
            setInput(val);
            setError('');
          }}
          placeholder={inputPlaceholder}
          rows={15}
        />
        <TextArea
          label={mode === 'csv-to-json' ? 'JSON Output' : 'CSV Output'}
          value={output}
          onChange={setOutput}
          placeholder="Result will appear here..."
          readOnly
          rows={15}
        />
      </div>
    </div>
  );
}
