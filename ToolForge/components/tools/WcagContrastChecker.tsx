'use client';

import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Sparkles, RefreshCw, Palette, Check, Copy } from 'lucide-react';

export default function WcagContrastChecker() {
  const [fgColor, setFgColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#4f46e5');
  const [copied, setCopied] = useState(false);

  // Helper functions for relative luminance
  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const contrastRatio = useMemo(() => {
    try {
      const fgRgb = hexToRgb(fgColor);
      const bgRgb = hexToRgb(bgColor);
      const lum1 = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
      const lum2 = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      const ratio = (brightest + 0.05) / (darkest + 0.05);
      return Number(ratio.toFixed(2));
    } catch {
      return 1;
    }
  }, [fgColor, bgColor]);

  // Pass / Fail logic
  const normalAA = contrastRatio >= 4.5;
  const normalAAA = contrastRatio >= 7.0;
  const largeAA = contrastRatio >= 3.0;
  const largeAAA = contrastRatio >= 4.5;
  const uiAA = contrastRatio >= 3.0;

  const autoFix = () => {
    // Quick contrast enhancement
    setFgColor('#ffffff');
    setBgColor('#1e1b4b');
  };

  const swapColors = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Color Selectors & Score Column */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-indigo-500" />
              Color Selection
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={swapColors}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Swap
              </button>
              <button
                onClick={autoFix}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100"
              >
                <Sparkles className="w-3.5 h-3.5" /> Auto-Fix AA
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Text Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Foreground / Text Color
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Background Color
              </label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-9 h-9 rounded-lg cursor-pointer border-0 p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full bg-transparent text-xs font-mono font-bold uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contrast Score Big Badge */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Contrast Ratio
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {contrastRatio}:1
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {contrastRatio >= 7.0
                ? '🌟 Exceptional contrast (Passes AAA standards)'
                : contrastRatio >= 4.5
                ? '✅ Great contrast (Passes standard AA requirements)'
                : contrastRatio >= 3.0
                ? '⚠️ Acceptable only for large headings & UI borders'
                : '❌ Poor readability (Fails WCAG 2.1)'}
            </p>
          </div>
        </div>
      </div>

      {/* WCAG Compliance Matrix & Live Preview */}
      <div className="lg:col-span-6 space-y-6">
        {/* Compliance Table */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            WCAG 2.1 Compliance Status
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            {/* Normal AA */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Normal Text (AA)</span>
              <span className="text-[10px] text-slate-500 block">Min 4.5:1</span>
              <div
                className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                  normalAA
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300'
                }`}
              >
                {normalAA ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {normalAA ? 'PASS' : 'FAIL'}
              </div>
            </div>

            {/* Normal AAA */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Normal Text (AAA)</span>
              <span className="text-[10px] text-slate-500 block">Min 7.0:1</span>
              <div
                className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                  normalAAA
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300'
                }`}
              >
                {normalAAA ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {normalAAA ? 'PASS' : 'FAIL'}
              </div>
            </div>

            {/* Large Text AA */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-400 block font-semibold">Large Headings (AA)</span>
              <span className="text-[10px] text-slate-500 block">Min 3.0:1</span>
              <div
                className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                  largeAA
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300'
                    : 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300'
                }`}
              >
                {largeAA ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {largeAA ? 'PASS' : 'FAIL'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Typography Preview Box */}
        <div
          className="p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
          style={{ backgroundColor: bgColor, color: fgColor }}
        >
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block mb-1">
            Live Rendering Preview
          </span>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            The Quick Brown Fox Jumps Over The Lazy Dog
          </h3>
          <p className="text-xs sm:text-sm leading-relaxed opacity-90">
            Good design starts with accessible typography. Ensuring sufficient contrast guarantees every visitor can read your content comfortably across devices and lighting conditions.
          </p>
        </div>
      </div>
    </div>
  );
}
