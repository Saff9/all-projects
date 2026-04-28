'use client';

import { useState, useCallback } from 'react';

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState<'standard' | 'uppercase' | 'no-dashes'>('standard');

  const generateUUID = useCallback(() => {
    return crypto.randomUUID();
  }, []);

  const generate = useCallback(() => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      let uuid = generateUUID();
      
      switch (format) {
        case 'uppercase':
          uuid = uuid.toUpperCase();
          break;
        case 'no-dashes':
          uuid = uuid.replace(/-/g, '');
          break;
        default:
          break;
      }
      
      newUuids.push(uuid);
    }
    setUuids(newUuids);
  }, [count, format, generateUUID]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          UUID Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Generate random UUIDs (Universally Unique Identifiers) version 4.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Count:</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Format:</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'standard' | 'uppercase' | 'no-dashes')}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="standard">Standard (xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx)</option>
            <option value="uppercase">Uppercase</option>
            <option value="no-dashes">No Dashes</option>
          </select>
        </div>

        <button
          onClick={generate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate
        </button>

        {uuids.length > 0 && (
          <button
            onClick={copyAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Copy All
          </button>
        )}
      </div>

      {uuids.length > 0 && (
        <div className="space-y-2">
          {uuids.map((uuid, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm text-gray-400 w-8">{index + 1}.</span>
              <code className="flex-1 font-mono text-sm text-gray-900 dark:text-white">
                {uuid}
              </code>
              <button
                onClick={() => copyToClipboard(uuid)}
                className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Copy
              </button>
            </div>
          ))}
        </div>
      )}

      {uuids.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
          Click Generate to create UUIDs
        </div>
      )}
    </div>
  );
}
