'use client';

import { useState, useCallback, useMemo } from 'react';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';
import TextArea from '@/components/TextArea';
import { sanitizeString } from '@/utils/security';
import { GitCompare, ArrowRight, ArrowLeft, Copy, Download, RefreshCw, FileText } from 'lucide-react';

interface DiffLine {
  type: 'unchanged' | 'added' | 'removed';
  content: string;
  lineNumber: number;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  // Simple line-by-line diff
  const diff: DiffLine[] = [];
  
  let i = 0;
  let j = 0;
  let lineNum = 1;
  
  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      // Only new lines remain
      diff.push({ type: 'added', content: newLines[j], lineNumber: lineNum++ });
      j++;
    } else if (j >= newLines.length) {
      // Only old lines remain
      diff.push({ type: 'removed', content: oldLines[i], lineNumber: lineNum++ });
      i++;
    } else if (oldLines[i] === newLines[j]) {
      // Lines are the same
      diff.push({ type: 'unchanged', content: oldLines[i], lineNumber: lineNum++ });
      i++;
      j++;
    } else {
      // Lines are different - try to find match
      let foundMatch = false;
      for (let k = 1; k <= 3; k++) {
        if (i + k < oldLines.length && oldLines[i + k] === newLines[j]) {
          // Old lines were removed
          for (let m = 0; m < k; m++) {
            diff.push({ type: 'removed', content: oldLines[i + m], lineNumber: lineNum++ });
          }
          i += k;
          foundMatch = true;
          break;
        }
        if (j + k < newLines.length && oldLines[i] === newLines[j + k]) {
          // New lines were added
          for (let m = 0; m < k; m++) {
            diff.push({ type: 'added', content: newLines[j + m], lineNumber: lineNum++ });
          }
          j += k;
          foundMatch = true;
          break;
        }
      }
      
      if (!foundMatch) {
        // Mark as removed and added
        diff.push({ type: 'removed', content: oldLines[i], lineNumber: lineNum++ });
        diff.push({ type: 'added', content: newLines[j], lineNumber: lineNum++ });
        i++;
        j++;
      }
    }
  }
  
  return diff;
}

export default function TextDiffViewer() {
  const [oldText, setOldText] = useState('');
  const [newText, setNewText] = useState('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);

  const diff = useMemo(() => {
    const oldProcessed = ignoreWhitespace ? oldText.trim() : oldText;
    const newProcessed = ignoreWhitespace ? newText.trim() : newText;
    return computeDiff(oldProcessed, newProcessed);
  }, [oldText, newText, ignoreWhitespace]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let unchanged = 0;
    diff.forEach(line => {
      if (line.type === 'added') added++;
      else if (line.type === 'removed') removed++;
      else unchanged++;
    });
    return { added, removed, unchanged };
  }, [diff]);

  const copyDiff = useCallback(async () => {
    const text = diff.map(line => {
      const prefix = line.type === 'added' ? '+ ' : line.type === 'removed' ? '- ' : '  ';
      return prefix + line.content;
    }).join('\n');
    await navigator.clipboard.writeText(text);
  }, [diff]);

  const loadSample = () => {
    setOldText(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

function applyDiscount(total, discount) {
  return total * (1 - discount);
}`);

    setNewText(`function calculateTotal(items) {
  let total = 0;
  for (const item of items) {
    total += item.price * item.quantity;
  }
  return total;
}

function applyDiscount(total, discount) {
  if (discount < 0 || discount > 1) {
    throw new Error('Invalid discount');
  }
  return total * (1 - discount);
}

function calculateTax(total, rate) {
  return total * rate;
}`);
  };

  const swapTexts = () => {
    const temp = oldText;
    setOldText(newText);
    setNewText(temp);
  };

  const statsColors = {
    added: 'text-green-400 bg-green-400/10',
    removed: 'text-red-400 bg-red-400/10',
    unchanged: 'text-zinc-400 bg-zinc-400/10',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-yellow-400" />
            Text Diff Viewer
          </h1>
          <p className="text-gray-400">
            Compare two texts and see the differences
          </p>
        </div>
        <BackButton />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* View Mode Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-zinc-700">
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-4 py-2 text-sm transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-4 py-2 text-sm transition-colors ${
              viewMode === 'unified'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            Unified
          </button>
        </div>

        {/* Options */}
        <label className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-600 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-zinc-400">Ignore whitespace</span>
        </label>

        {/* Actions */}
        <button
          onClick={swapTexts}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <ArrowLeft className="w-4 h-4" />
          Swap
        </button>

        <button
          onClick={loadSample}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <FileText className="w-4 h-4" />
          Load Sample
        </button>

        <button
          onClick={() => { setOldText(''); setNewText(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Clear
        </button>

        <button
          onClick={copyDiff}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy Diff
        </button>

        {/* Stats */}
        <div className="flex gap-4 ml-auto">
          <span className={`px-3 py-1 rounded-full text-sm ${statsColors.added}`}>
            +{stats.added} added
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${statsColors.removed}`}>
            -{stats.removed} removed
          </span>
          <span className={`px-3 py-1 rounded-full text-sm ${statsColors.unchanged}`}>
            {stats.unchanged} unchanged
          </span>
        </div>
      </div>

      {/* Input Areas (Side by Side) */}
      {viewMode === 'side-by-side' && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700">
              <span className="text-sm font-medium text-red-400">Original</span>
            </div>
            <TextArea
              value={oldText}
              onChange={(val) => setOldText(sanitizeString(val, 100000))}
              placeholder="Paste original text here..."
              rows={15}
              className="border-0 rounded-none"
            />
          </div>
          <div className="glass rounded-xl overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700">
              <span className="text-sm font-medium text-green-400">Modified</span>
            </div>
            <TextArea
              value={newText}
              onChange={(val) => setNewText(sanitizeString(val, 100000))}
              placeholder="Paste modified text here..."
              rows={15}
              className="border-0 rounded-none"
            />
          </div>
        </div>
      )}

      {/* Diff Output */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 flex items-center justify-between">
          <span className="text-sm font-medium text-white">Diff Output</span>
          {viewMode === 'unified' && (
            <span className="text-xs text-zinc-500">
              Use arrow keys to navigate | Press ESC to close
            </span>
          )}
        </div>
        
        <div className="overflow-x-auto">
          {diff.length > 0 ? (
            viewMode === 'side-by-side' ? (
              <div className="grid grid-cols-2">
                <div className="border-r border-zinc-700">
                  {diff.filter(l => l.type !== 'added').map((line, i) => (
                    <div
                      key={i}
                      className={`px-4 py-1 font-mono text-sm whitespace-pre-wrap break-all ${
                        line.type === 'removed'
                          ? 'bg-red-500/10 text-red-300'
                          : 'text-zinc-400'
                      }`}
                    >
                      <span className="inline-block w-8 text-zinc-600 select-none">{line.lineNumber}</span>
                      {line.content || ' '}
                    </div>
                  ))}
                </div>
                <div>
                  {diff.filter(l => l.type !== 'removed').map((line, i) => (
                    <div
                      key={i}
                      className={`px-4 py-1 font-mono text-sm whitespace-pre-wrap break-all ${
                        line.type === 'added'
                          ? 'bg-green-500/10 text-green-300'
                          : 'text-zinc-400'
                      }`}
                    >
                      <span className="inline-block w-8 text-zinc-600 select-none">{line.lineNumber}</span>
                      {line.content || ' '}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Unified view
              <table className="w-full">
                <tbody>
                  {diff.map((line, i) => (
                    <tr
                      key={i}
                      className={
                        line.type === 'added'
                          ? 'bg-green-500/10'
                          : line.type === 'removed'
                          ? 'bg-red-500/10'
                          : ''
                      }
                    >
                      <td className="px-4 py-1 font-mono text-sm text-zinc-500 w-12 select-none">
                        {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                      </td>
                      <td className={`px-4 py-1 font-mono text-sm whitespace-pre-wrap break-all ${
                        line.type === 'added'
                          ? 'text-green-300'
                          : line.type === 'removed'
                          ? 'text-red-300'
                          : 'text-zinc-400'
                      }`}>
                        {line.content || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <div className="p-8 text-center text-zinc-500">
              Enter text above and click "Compare" to see differences
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
