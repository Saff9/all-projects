'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

export default function TextSorter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [stats, setStats] = useState({ lines: 0, words: 0, chars: 0, unique: 0 });

  const updateStats = useCallback((text: string) => {
    const lines = text.split('\n').filter(l => l.trim()).length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    const unique = new Set(text.split('\n').filter(l => l.trim())).size;
    setStats({ lines, words, chars, unique });
  }, []);

  const sortAsc = useCallback(() => {
    const lines = input.split('\n');
    const sorted = lines.sort((a, b) => a.localeCompare(b));
    const result = sorted.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const sortDesc = useCallback(() => {
    const lines = input.split('\n');
    const sorted = lines.sort((a, b) => b.localeCompare(a));
    const result = sorted.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const removeDuplicates = useCallback(() => {
    const lines = input.split('\n');
    const unique = [...new Set(lines)];
    const result = unique.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const removeEmpty = useCallback(() => {
    const lines = input.split('\n');
    const nonEmpty = lines.filter(line => line.trim() !== '');
    const result = nonEmpty.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const reverse = useCallback(() => {
    const lines = input.split('\n');
    const reversed = lines.reverse();
    const result = reversed.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const shuffle = useCallback(() => {
    const lines = input.split('\n');
    const shuffled = [...lines].sort(() => Math.random() - 0.5);
    const result = shuffled.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const trimWhitespace = useCallback(() => {
    const lines = input.split('\n');
    const trimmed = lines.map(line => line.trim());
    const result = trimmed.join('\n');
    setOutput(result);
    updateStats(result);
  }, [input, updateStats]);

  const handleInputChange = (value: string) => {
    setInput(value);
    updateStats(value);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Text Sorter
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Sort lines, remove duplicates, and clean up text.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Lines', value: stats.lines },
          { label: 'Words', value: stats.words },
          { label: 'Characters', value: stats.chars },
          { label: 'Unique Lines', value: stats.unique },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-center"
          >
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={sortAsc}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sort A-Z
        </button>
        <button
          onClick={sortDesc}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sort Z-A
        </button>
        <button
          onClick={removeDuplicates}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Remove Duplicates
        </button>
        <button
          onClick={removeEmpty}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Remove Empty
        </button>
        <button
          onClick={reverse}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reverse
        </button>
        <button
          onClick={shuffle}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Shuffle
        </button>
        <button
          onClick={trimWhitespace}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Trim Whitespace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TextArea
          label="Input"
          value={input}
          onChange={handleInputChange}
          placeholder="Enter text here (one item per line)..."
          rows={20}
        />
        <TextArea
          label="Output"
          value={output}
          onChange={setOutput}
          placeholder="Result will appear here..."
          readOnly
          rows={20}
        />
      </div>
    </div>
  );
}
