'use client';

import { useState } from 'react';
import { Layers, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

const BG_PRESETS = [
  { name: 'Aurora Gradient', bgClass: 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500' },
  { name: 'Cyberpunk Neon', bgClass: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-600' },
  { name: 'Sunset Glow', bgClass: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600' },
  { name: 'Dark Space', bgClass: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900' },
];

export default function GlassmorphismGenerator() {
  const [blur, setBlur] = useState(16);
  const [transparency, setTransparency] = useState(0.25);
  const [borderOpacity, setBorderOpacity] = useState(0.2);
  const [tintColor, setTintColor] = useState('#ffffff');
  const [bgPreset, setBgPreset] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  };

  const rgb = hexToRgb(tintColor);
  const bgRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${transparency})`;
  const borderRgba = `rgba(255, 255, 255, ${borderOpacity})`;

  const cssCode = `/* Glassmorphism CSS */
background: ${bgRgba};
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border: 1px solid ${borderRgba};
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
border-radius: 20px;`;

  const tailwindCode = `bg-[${bgRgba}] backdrop-blur-[${blur}px] border border-[${borderRgba}] shadow-2xl rounded-2xl`;

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
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            Glass Properties
          </h2>

          {/* Blur slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Blur Radius</span>
              <span className="font-mono">{blur}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={40}
              value={blur}
              onChange={(e) => setBlur(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Transparency slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Background Opacity</span>
              <span className="font-mono">{Math.round(transparency * 100)}%</span>
            </div>
            <input
              type="range"
              min={0.05}
              max={0.9}
              step={0.01}
              value={transparency}
              onChange={(e) => setTransparency(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Border Opacity slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Border Opacity</span>
              <span className="font-mono">{Math.round(borderOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.8}
              step={0.02}
              value={borderOpacity}
              onChange={(e) => setBorderOpacity(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Tint Color */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Glass Tint Color
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={tintColor}
                onChange={(e) => setTintColor(e.target.value)}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono">{tintColor}</span>
            </div>
          </div>

          {/* Background switcher */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Background Test Canvas
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BG_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setBgPreset(idx)}
                  className={`h-10 rounded-xl ${preset.bgClass} border-2 transition-all ${
                    bgPreset === idx ? 'border-white scale-105 shadow-md' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                  title={preset.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview & Code Column */}
      <div className="lg:col-span-6 space-y-6">
        {/* Sandbox Canvas */}
        <div
          className={`p-10 sm:p-14 rounded-3xl ${BG_PRESETS[bgPreset].bgClass} min-h-[320px] flex items-center justify-center relative overflow-hidden`}
        >
          {/* Floating decorative elements behind glass */}
          <div className="w-28 h-28 rounded-full bg-pink-400 absolute -top-4 -left-4 blur-xs opacity-70 animate-pulse-glow" />
          <div className="w-36 h-36 rounded-full bg-indigo-500 absolute -bottom-8 -right-8 blur-xs opacity-70 animate-pulse-glow" />

          {/* Glass Card */}
          <div
            className="w-full max-w-sm p-6 text-white text-center transition-all duration-150 relative z-10"
            style={{
              background: bgRgba,
              backdropFilter: `blur(${blur}px)`,
              WebkitBackdropFilter: `blur(${blur}px)`,
              border: `1px solid ${borderRgba}`,
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
              borderRadius: '20px',
            }}
          >
            <Sparkles className="w-7 h-7 mx-auto mb-2 text-white/90" />
            <h3 className="text-lg font-bold">Frosted Glass Card</h3>
            <p className="text-xs text-white/80 mt-1 leading-relaxed">
              Modern iOS and macOS styled glassmorphism with dynamic optical blur.
            </p>
            <button className="mt-4 px-4 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-semibold border border-white/30 backdrop-blur-xs transition-colors">
              Action Button
            </button>
          </div>
        </div>

        {/* Code Output */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generated Code</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(cssCode, 'css')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                {copied === 'css' ? 'Copied CSS!' : 'Copy CSS'}
              </button>
              <button
                onClick={() => handleCopy(tailwindCode, 'tw')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors"
              >
                {copied === 'tw' ? 'Copied Tailwind!' : 'Tailwind'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
            <code>{cssCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
