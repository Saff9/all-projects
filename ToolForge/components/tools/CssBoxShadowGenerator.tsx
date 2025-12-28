'use client';

import { useState } from 'react';
import { Sun, Copy, Check, Plus, Trash2, Sparkles, Layers } from 'lucide-react';

interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
  inset: boolean;
}

const PRESETS: { name: string; layers: ShadowLayer[] }[] = [
  {
    name: 'Apple Subtle Depth',
    layers: [
      { x: 0, y: 4, blur: 6, spread: -1, color: '#000000', opacity: 0.1, inset: false },
      { x: 0, y: 2, blur: 4, spread: -2, color: '#000000', opacity: 0.1, inset: false },
    ],
  },
  {
    name: 'Soft Floating 3D',
    layers: [
      { x: 0, y: 15, blur: 30, spread: -5, color: '#4f46e5', opacity: 0.25, inset: false },
      { x: 0, y: 5, blur: 15, spread: -3, color: '#000000', opacity: 0.1, inset: false },
    ],
  },
  {
    name: 'Cyberpunk Neon Glow',
    layers: [
      { x: 0, y: 0, blur: 15, spread: 2, color: '#14b8a6', opacity: 0.6, inset: false },
      { x: 0, y: 0, blur: 30, spread: 8, color: '#6366f1', opacity: 0.4, inset: false },
    ],
  },
  {
    name: 'Sharp Outline Shadow',
    layers: [{ x: 6, y: 6, blur: 0, spread: 0, color: '#0f172a', opacity: 1, inset: false }],
  },
];

export default function CssBoxShadowGenerator() {
  const [layers, setLayers] = useState<ShadowLayer[]>([
    { x: 0, y: 10, blur: 25, spread: -5, color: '#000000', opacity: 0.15, inset: false },
    { x: 0, y: 8, blur: 10, spread: -6, color: '#000000', opacity: 0.1, inset: false },
  ]);
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgba = (hex: string, opacity: number) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const boxShadowCssValue = layers
    .map((l) => `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${hexToRgba(l.color, l.opacity)}`)
    .join(', ');

  const cssRule = `box-shadow: ${boxShadowCssValue};`;
  const tailwindValue = `shadow-[${boxShadowCssValue.replace(/\s+/g, '_')}]`;

  const addLayer = () => {
    setLayers([
      ...layers,
      { x: 0, y: 10, blur: 20, spread: 0, color: '#000000', opacity: 0.15, inset: false },
    ]);
  };

  const updateLayer = (index: number, field: keyof ShadowLayer, value: any) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], [field]: value };
    setLayers(updated);
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          {/* Presets */}
          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Designer Presets
            </span>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setLayers(p.layers)}
                  className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Layer List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Shadow Layers ({layers.length})
              </span>
              {layers.length < 4 && (
                <button
                  onClick={addLayer}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Layer
                </button>
              )}
            </div>

            {layers.map((layer, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Layer #{idx + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={layer.inset}
                        onChange={(e) => updateLayer(idx, 'inset', e.target.checked)}
                        className="rounded text-indigo-600 w-3.5 h-3.5"
                      />
                      Inset
                    </label>
                    {layers.length > 1 && (
                      <button
                        onClick={() => setLayers(layers.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">X Offset</span>
                      <span className="font-mono">{layer.x}px</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={layer.x}
                      onChange={(e) => updateLayer(idx, 'x', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Y Offset</span>
                      <span className="font-mono">{layer.y}px</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={layer.y}
                      onChange={(e) => updateLayer(idx, 'y', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Blur</span>
                      <span className="font-mono">{layer.blur}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={layer.blur}
                      onChange={(e) => updateLayer(idx, 'blur', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-500">Spread</span>
                      <span className="font-mono">{layer.spread}px</span>
                    </div>
                    <input
                      type="range"
                      min={-30}
                      max={50}
                      value={layer.spread}
                      onChange={(e) => updateLayer(idx, 'spread', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={layer.color}
                      onChange={(e) => updateLayer(idx, 'color', e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-xs font-mono">{layer.color}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Opacity</span>
                      <span className="font-mono">{Math.round(layer.opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={layer.opacity}
                      onChange={(e) => updateLayer(idx, 'opacity', Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview & Code Column */}
      <div className="lg:col-span-6 space-y-6">
        {/* Preview Sandbox */}
        <div className="bg-slate-100 dark:bg-slate-950 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center min-h-[300px]">
          <div
            className="w-48 h-48 sm:w-56 sm:h-56 bg-white dark:bg-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center transition-all duration-150"
            style={{ boxShadow: boxShadowCssValue }}
          >
            <Sun className="w-8 h-8 text-indigo-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Shadow Card</h4>
            <p className="text-[11px] text-slate-400 mt-1">Multi-layer depth preview</p>
          </div>
        </div>

        {/* Code Output */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generated Code</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(cssRule, 'css')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                {copied === 'css' ? 'Copied CSS!' : 'Copy CSS'}
              </button>
              <button
                onClick={() => handleCopy(tailwindValue, 'tw')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
              >
                {copied === 'tw' ? 'Copied Tailwind!' : 'Tailwind Class'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{cssRule}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
