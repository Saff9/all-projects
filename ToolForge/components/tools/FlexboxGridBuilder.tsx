'use client';

import { useState } from 'react';
import { LayoutGrid, Copy, Check, Plus, Trash2, Sparkles, RefreshCw } from 'lucide-react';

export default function FlexboxGridBuilder() {
  const [layoutMode, setLayoutMode] = useState<'flex' | 'grid'>('flex');
  const [itemsCount, setItemsCount] = useState(6);

  // Flex state
  const [flexDirection, setFlexDirection] = useState<'row' | 'row-reverse' | 'column' | 'column-reverse'>('row');
  const [justifyContent, setJustifyContent] = useState<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>('space-between');
  const [alignItems, setAlignItems] = useState<'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'>('center');
  const [flexWrap, setFlexWrap] = useState<'nowrap' | 'wrap' | 'wrap-reverse'>('wrap');
  const [gap, setGap] = useState(16);

  // Grid state
  const [gridCols, setGridCols] = useState(3);
  const [gridRows, setGridRows] = useState(2);

  const [copied, setCopied] = useState<string | null>(null);

  // Generate CSS & Tailwind
  const flexCss = `/* Flexbox Container */
display: flex;
flex-direction: ${flexDirection};
justify-content: ${justifyContent};
align-items: ${alignItems};
flex-wrap: ${flexWrap};
gap: ${gap}px;`;

  const gridCss = `/* Grid Container */
display: grid;
grid-template-columns: repeat(${gridCols}, minmax(0, 1fr));
gap: ${gap}px;`;

  const flexTw = `flex ${flexDirection === 'row' ? 'flex-row' : flexDirection === 'column' ? 'flex-col' : flexDirection} ${
    justifyContent === 'space-between' ? 'justify-between' : justifyContent === 'center' ? 'justify-center' : `justify-[${justifyContent}]`
  } ${alignItems === 'center' ? 'items-center' : `items-[${alignItems}]`} ${flexWrap} gap-[${gap}px]`;

  const gridTw = `grid grid-cols-${gridCols} gap-[${gap}px]`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => setLayoutMode('flex')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                layoutMode === 'flex'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              CSS Flexbox
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`flex-1 py-1.5 rounded-lg transition-colors ${
                layoutMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              CSS Grid
            </button>
          </div>

          {/* Dynamic Controls per Mode */}
          {layoutMode === 'flex' ? (
            <div className="space-y-4 text-xs">
              {/* Flex Direction */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  flex-direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['row', 'row-reverse', 'column', 'column-reverse'] as const).map((dir) => (
                    <button
                      key={dir}
                      onClick={() => setFlexDirection(dir)}
                      className={`py-1.5 px-2 rounded-lg font-mono border ${
                        flexDirection === dir
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              {/* Justify Content */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  justify-content
                </label>
                <select
                  value={justifyContent}
                  onChange={(e) => setJustifyContent(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                >
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="space-between">space-between</option>
                  <option value="space-around">space-around</option>
                  <option value="space-evenly">space-evenly</option>
                </select>
              </div>

              {/* Align Items */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  align-items
                </label>
                <select
                  value={alignItems}
                  onChange={(e) => setAlignItems(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                >
                  <option value="flex-start">flex-start</option>
                  <option value="center">center</option>
                  <option value="flex-end">flex-end</option>
                  <option value="stretch">stretch</option>
                  <option value="baseline">baseline</option>
                </select>
              </div>

              {/* Flex Wrap */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  flex-wrap
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['nowrap', 'wrap', 'wrap-reverse'] as const).map((wrap) => (
                    <button
                      key={wrap}
                      onClick={() => setFlexWrap(wrap)}
                      className={`py-1.5 px-2 rounded-lg font-mono border ${
                        flexWrap === wrap
                          ? 'bg-indigo-600 border-indigo-600 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {wrap}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              {/* Grid Columns */}
              <div>
                <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>grid-template-columns</span>
                  <span className="font-mono">{gridCols} columns</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={gridCols}
                  onChange={(e) => setGridCols(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Gap Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <span>Gap Spacing</span>
              <span className="font-mono">{gap}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={48}
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Child Items Count */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Child Boxes: {itemsCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setItemsCount((prev) => Math.max(1, prev - 1))}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                -
              </button>
              <button
                onClick={() => setItemsCount((prev) => Math.min(18, prev + 1))}
                className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Visual Canvas & Code */}
      <div className="lg:col-span-7 space-y-6">
        {/* Visual Box Canvas */}
        <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[340px] flex flex-col justify-center">
          <div
            className="w-full min-h-[260px] p-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800/80 bg-white/60 dark:bg-slate-900/60 transition-all"
            style={
              layoutMode === 'flex'
                ? {
                    display: 'flex',
                    flexDirection,
                    justifyContent,
                    alignItems,
                    flexWrap,
                    gap: `${gap}px`,
                  }
                : {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                    gap: `${gap}px`,
                  }
            }
          >
            {Array.from({ length: itemsCount }).map((_, i) => (
              <div
                key={i}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-400 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Generated Code */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generated CSS</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(layoutMode === 'flex' ? flexCss : gridCss, 'css')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                {copied === 'css' ? 'Copied CSS!' : 'Copy CSS'}
              </button>
              <button
                onClick={() => handleCopy(layoutMode === 'flex' ? flexTw : gridTw, 'tw')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
              >
                {copied === 'tw' ? 'Copied Tailwind!' : 'Tailwind'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{layoutMode === 'flex' ? flexCss : gridCss}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
