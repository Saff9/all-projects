'use client';

import { useState, useMemo } from 'react';

interface GridShadow {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export default function CSSGridGenerator() {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(3);
  const [gap, setGap] = useState(16);
  const [columnGap, setColumnGap] = useState(16);
  const [rowGap, setRowGap] = useState(16);
  const [justifyItems, setJustifyItems] = useState('stretch');
  const [alignItems, setAlignItems] = useState('stretch');
  const [columnWidth, setColumnWidth] = useState('1fr');
  const [rowHeight, setRowHeight] = useState('1fr');

  const cssCode = useMemo(() => {
    return `.container {
  display: grid;
  grid-template-columns: ${Array(columns).fill(columnWidth).join(' ')};
  grid-template-rows: ${Array(rows).fill(rowHeight).join(' ')};
  gap: ${gap}px;
  column-gap: ${columnGap}px;
  row-gap: ${rowGap}px;
  justify-items: ${justifyItems};
  align-items: ${alignItems};
}`;
  }, [columns, rows, gap, columnGap, rowGap, justifyItems, alignItems, columnWidth, rowHeight]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          CSS Grid Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create CSS grid layouts with interactive controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Grid Dimensions</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Columns: {columns}
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={columns}
                  onChange={(e) => setColumns(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rows: {rows}
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Column Width
                </label>
                <select
                  value={columnWidth}
                  onChange={(e) => setColumnWidth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1fr">1fr</option>
                  <option value="auto">auto</option>
                  <option value="100px">100px</option>
                  <option value="200px">200px</option>
                  <option value="minmax(100px, 1fr)">minmax(100px, 1fr)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Row Height
                </label>
                <select
                  value={rowHeight}
                  onChange={(e) => setRowHeight(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="1fr">1fr</option>
                  <option value="auto">auto</option>
                  <option value="100px">100px</option>
                  <option value="200px">200px</option>
                  <option value="minmax(100px, 1fr)">minmax(100px, 1fr)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Gap: {gap}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={gap}
                  onChange={(e) => setGap(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Col Gap: {columnGap}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={columnGap}
                  onChange={(e) => setColumnGap(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Row Gap: {rowGap}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={rowGap}
                  onChange={(e) => setRowGap(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Alignment</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Justify Items
                </label>
                <select
                  value={justifyItems}
                  onChange={(e) => setJustifyItems(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="stretch">stretch</option>
                  <option value="start">start</option>
                  <option value="end">end</option>
                  <option value="center">center</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Align Items
                </label>
                <select
                  value={alignItems}
                  onChange={(e) => setAlignItems(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="stretch">stretch</option>
                  <option value="start">start</option>
                  <option value="end">end</option>
                  <option value="center">center</option>
                </select>
              </div>
            </div>
          </div>

          {/* Generated Code */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated CSS</h3>
              <button
                onClick={() => copyToClipboard(cssCode)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{cssCode}</code>
            </pre>
          </div>
        </div>

        {/* Preview */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Preview</h3>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-lg min-h-[400px]"
            style={{
              display: 'grid',
              gridTemplateColumns: Array(columns).fill(columnWidth).join(' '),
              gridTemplateRows: Array(rows).fill(rowHeight).join(' '),
              gap: `${gap}px`,
              columnGap: `${columnGap}px`,
              rowGap: `${rowGap}px`,
              justifyItems,
              alignItems,
            }}
          >
            {Array.from({ length: columns * rows }).map((_, i) => (
              <div
                key={i}
                className="bg-blue-500 text-white font-medium rounded flex items-center justify-center min-h-[60px]"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
