'use client';

import { useState, useCallback } from 'react';
import TextArea from '@/components/TextArea';

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  line: string;
  lineNum: number;
}

export default function DiffChecker() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [showDiff, setShowDiff] = useState(false);

  const computeDiff = useCallback(() => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: DiffLine[] = [];

    // Simple line-by-line diff
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i];
      const line2 = lines2[i];

      if (line1 === undefined && line2 !== undefined) {
        result.push({ type: 'added', line: line2, lineNum: i + 1 });
      } else if (line1 !== undefined && line2 === undefined) {
        result.push({ type: 'removed', line: line1, lineNum: i + 1 });
      } else if (line1 !== line2) {
        if (line1 !== '') result.push({ type: 'removed', line: line1, lineNum: i + 1 });
        if (line2 !== '') result.push({ type: 'added', line: line2, lineNum: i + 1 });
      } else {
        result.push({ type: 'same', line: line1, lineNum: i + 1 });
      }
    }

    setDiff(result);
    setShowDiff(true);
  }, [text1, text2]);

  const getStats = () => {
    const added = diff.filter(d => d.type === 'added').length;
    const removed = diff.filter(d => d.type === 'removed').length;
    const same = diff.filter(d => d.type === 'same').length;
    return { added, removed, same };
  };

  const stats = getStats();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Diff Checker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compare two texts and find the differences.
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={computeDiff}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Compare
        </button>
        <button
          onClick={() => { setText1(''); setText2(''); setDiff([]); setShowDiff(false); }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TextArea
          label="Original Text"
          value={text1}
          onChange={setText1}
          placeholder="Paste original text here..."
          rows={15}
        />
        <TextArea
          label="Modified Text"
          value={text2}
          onChange={setText2}
          placeholder="Paste modified text here..."
          rows={15}
        />
      </div>

      {showDiff && (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Diff Results</h3>
            <div className="flex gap-4 text-sm">
              <span className="text-green-600 dark:text-green-400">+ {stats.added} added</span>
              <span className="text-red-600 dark:text-red-400">- {stats.removed} removed</span>
              <span className="text-gray-600 dark:text-gray-400">{stats.same} unchanged</span>
            </div>
          </div>

          <div className="font-mono text-sm overflow-x-auto">
            {diff.length === 0 ? (
              <p className="text-gray-500">No differences found (or no text to compare)</p>
            ) : (
              <table className="w-full">
                <tbody>
                  {diff.map((line, i) => (
                    <tr
                      key={i}
                      className={`${
                        line.type === 'added'
                          ? 'bg-green-50 dark:bg-green-900/20'
                          : line.type === 'removed'
                          ? 'bg-red-50 dark:bg-red-900/20'
                          : ''
                      }`}
                    >
                      <td className="px-2 py-1 text-right text-gray-400 w-12 select-none border-r border-gray-200 dark:border-gray-700">
                        {line.lineNum}
                      </td>
                      <td className="px-2 py-1 w-8 text-center select-none">
                        {line.type === 'added' && <span className="text-green-600">+</span>}
                        {line.type === 'removed' && <span className="text-red-600">-</span>}
                        {line.type === 'same' && <span className="text-gray-400"> </span>}
                      </td>
                      <td className="px-2 py-1 whitespace-pre">{line.line || ' '}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
