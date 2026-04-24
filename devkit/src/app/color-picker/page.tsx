'use client';

import { useState, useCallback, useEffect } from 'react';

interface HSL {
  h: number;
  s: number;
  l: number;
}

interface ColorHistory {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: HSL;
  timestamp: number;
}

export default function ColorPicker() {
  const [hex, setHex] = useState('#3B82F6');
  const [rgb, setRgb] = useState({ r: 59, g: 130, b: 246 });
  const [hsl, setHsl] = useState<HSL>({ h: 217, s: 91, l: 60 });
  const [history, setHistory] = useState<ColorHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'picker' | 'harmony' | 'palette'>('picker');
  const [harmonyType, setHarmonyType] = useState<'analogous' | 'complementary' | 'triadic' | 'split-complementary' | 'tetradic'>('complementary');
  const [exportFormat, setExportFormat] = useState<'css' | 'scss' | 'tailwind' | 'json'>('css');
  const [randomColor, setRandomColor] = useState('');
  const [contrastResult, setContrastResult] = useState<{ ratio: string; aa: boolean; aaa: boolean; largeAA: boolean; largeAAA: boolean } | null>(null);
  const [compareHex, setCompareHex] = useState('#FFFFFF');

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('color-picker-history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, x)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number): HSL => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const hslToRgb = (h: number, s: number, l: number) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const handleHexChange = (value: string) => {
    const newHex = value.startsWith('#') ? value : '#' + value;
    setHex(newHex);
    const newRgb = hexToRgb(newHex);
    if (newRgb) {
      setRgb(newRgb);
      setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
    }
  };

  const handleRgbChange = (key: keyof typeof rgb, value: number) => {
    const newRgb = { ...rgb, [key]: Math.max(0, Math.min(255, value)) };
    setRgb(newRgb);
    const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(newHex);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  };

  const handleHslChange = (key: keyof HSL, value: number) => {
    const newHsl = { ...hsl, [key]: value };
    setHsl(newHsl);
    const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
    setRgb(newRgb);
    setHex(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  const addToHistory = useCallback(() => {
    const newHistory = [{
      hex,
      rgb,
      hsl,
      timestamp: Date.now()
    }, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('color-picker-history', JSON.stringify(newHistory));
  }, [hex, rgb, hsl, history]);

  useEffect(() => {
    addToHistory();
  }, [hex]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateShades = () => {
    const shades = [];
    for (let i = 0; i <= 100; i += 10) {
      shades.push(hslToRgb(hsl.h, hsl.s, i));
    }
    return shades;
  };

  // Color harmony generation
  const generateHarmony = () => {
    const colors: { hex: string; rgb: { r: number; g: number; b: number }; label: string }[] = [];
    
    switch (harmonyType) {
      case 'analogous':
        for (let i = -30; i <= 30; i += 15) {
          const newHsl = { ...hsl, h: (hsl.h + i + 360) % 360 };
          const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
          colors.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgb: newRgb, label: `${i > 0 ? '+' : ''}${i}°` });
        }
        break;
      case 'complementary':
        colors.push({ hex, rgb, label: 'Base' });
        const compHsl = { ...hsl, h: (hsl.h + 180) % 360 };
        const compRgb = hslToRgb(compHsl.h, compHsl.s, compHsl.l);
        colors.push({ hex: rgbToHex(compRgb.r, compRgb.g, compRgb.b), rgb: compRgb, label: 'Complement' });
        break;
      case 'triadic':
        colors.push({ hex, rgb, label: 'Base' });
        for (let i = 120; i <= 240; i += 120) {
          const newHsl = { ...hsl, h: (hsl.h + i) % 360 };
          const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
          colors.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgb: newRgb, label: `Triad ${i/120}` });
        }
        break;
      case 'split-complementary':
        colors.push({ hex, rgb, label: 'Base' });
        for (let i = 150; i <= 210; i += 60) {
          const newHsl = { ...hsl, h: (hsl.h + i) % 360 };
          const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
          colors.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgb: newRgb, label: `Split ${i/30}°` });
        }
        break;
      case 'tetradic':
        colors.push({ hex, rgb, label: 'Base' });
        for (let i = 90; i <= 270; i += 90) {
          const newHsl = { ...hsl, h: (hsl.h + i) % 360 };
          const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
          colors.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgb: newRgb, label: `Quad ${i/90}` });
        }
        break;
    }
    
    return colors;
  };

  // Generate palette
  const generatePalette = () => {
    const colors: { hex: string; rgb: { r: number; g: number; b: number } }[] = [];
    for (let i = 0; i < 5; i++) {
      const newHsl = { ...hsl, h: (hsl.h + i * 30) % 360, s: Math.max(30, hsl.s - 20), l: Math.min(70, hsl.l + 10) };
      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      colors.push({ hex: rgbToHex(newRgb.r, newRgb.g, newRgb.b), rgb: newRgb });
    }
    return colors;
  };

  // Export palette
  const exportPalette = (colors: { hex: string }[]) => {
    let output = '';
    switch (exportFormat) {
      case 'css':
        output = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
        break;
      case 'scss':
        output = `${colors.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n')}`;
        break;
      case 'tailwind':
        output = `colors: {\n${colors.map((c, i) => `  '${c.hex.replace('#', '')}': '${c.hex}',`).join('\n')}\n}`;
        break;
      case 'json':
        output = JSON.stringify(colors.map(c => c.hex), null, 2);
        break;
    }
    navigator.clipboard.writeText(output);
    return output;
  };

  // Generate random color
  const generateRandomColor = () => {
    const newHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    handleHexChange(newHex);
    setRandomColor(newHex);
  };

  // WCAG Contrast Checker
  const checkContrast = () => {
    const fg = hexToRgb(hex);
    const bg = hexToRgb(compareHex);
    if (!fg || !bg) return;

    const luminance = (c: { r: number; g: number; b: number }) => {
      const [rs, gs, bs] = [c.r, c.g, c.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = luminance(fg);
    const l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    setContrastResult({
      ratio: ratio.toFixed(2),
      aa: ratio >= 4.5,
      aaa: ratio >= 7,
      largeAA: ratio >= 3,
      largeAAA: ratio >= 4.5
    });
  };

  useEffect(() => {
    checkContrast();
  }, [hex, compareHex]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Color Picker
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pick colors, generate palettes, and check accessibility.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('picker')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'picker'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Picker
        </button>
        <button
          onClick={() => setActiveTab('harmony')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'harmony'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Harmony
        </button>
        <button
          onClick={() => setActiveTab('palette')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'palette'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Palette
        </button>
        <button
          onClick={generateRandomColor}
          className="ml-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🎲 Random
        </button>
      </div>

      {activeTab === 'picker' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Preview */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div
              className="w-full h-64 rounded-xl mb-4 border border-gray-200 dark:border-gray-700"
              style={{ backgroundColor: hex }}
            />
            <div className="text-center">
              <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">{hex.toUpperCase()}</div>
              <div className="text-sm text-gray-500 mt-1">Click to copy</div>
            </div>
          </div>

          {/* Color Inputs */}
          <div className="space-y-6">
            {/* HEX */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HEX</label>
              <div className="flex gap-2">
                <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-l-lg text-gray-500">#</span>
                <input
                  type="text"
                  value={hex.replace('#', '')}
                  onChange={(e) => handleHexChange(e.target.value)}
                  maxLength={6}
                  className="flex-1 px-4 py-2 border-y border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono uppercase"
                />
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => handleHexChange(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* RGB */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">RGB</label>
              <div className="grid grid-cols-3 gap-4">
                {['r', 'g', 'b'].map(key => (
                  <div key={key}>
                    <span className="text-xs text-gray-500 uppercase">{key}</span>
                    <input
                      type="number"
                      value={rgb[key as keyof typeof rgb]}
                      onChange={(e) => handleRgbChange(key as keyof typeof rgb, parseInt(e.target.value) || 0)}
                      min={0}
                      max={255}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* HSL */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HSL</label>
              <div className="grid grid-cols-3 gap-4">
                {['h', 's', 'l'].map(key => (
                  <div key={key}>
                    <span className="text-xs text-gray-500 uppercase">{key}</span>
                    <input
                      type="number"
                      value={hsl[key as keyof HSL]}
                      onChange={(e) => handleHslChange(key as keyof HSL, parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Contrast Checker */}
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WCAG Contrast (vs {compareHex})
              </label>
              <input
                type="text"
                value={compareHex}
                onChange={(e) => setCompareHex(e.target.value)}
                placeholder="Background color (HEX)"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-2"
              />
              <div className="flex gap-2">
                <div
                  className="w-10 h-10 rounded border border-gray-200"
                  style={{ backgroundColor: hex }}
                />
                <div className="flex-1 p-2 rounded border border-gray-200" style={{ backgroundColor: compareHex }}>
                  <span style={{ color: hex }} className="font-bold">Sample Text</span>
                </div>
              </div>
              {contrastResult && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Contrast Ratio:</span>
                    <span className="font-mono font-bold">{contrastResult.ratio}:1</span>
                  </div>
                  <div className="flex gap-4">
                    <span className={`px-2 py-1 rounded ${contrastResult.aa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      AA: {contrastResult.aa ? '✓' : '✗'}
                    </span>
                    <span className={`px-2 py-1 rounded ${contrastResult.aaa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      AAA: {contrastResult.aaa ? '✓' : '✗'}
                    </span>
                    <span className={`px-2 py-1 rounded ${contrastResult.largeAA ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      Large AA: {contrastResult.largeAA ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'harmony' ? (
        <div className="space-y-6">
          <div className="flex gap-2 mb-4">
            {(['analogous', 'complementary', 'triadic', 'split-complementary', 'tetradic'] as const).map(type => (
              <button
                key={type}
                onClick={() => setHarmonyType(type)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  harmonyType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {generateHarmony().map((color, i) => (
              <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div
                  className="w-full h-20 rounded-lg mb-2 border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-center">
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">{color.hex.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">{color.label}</div>
                  <button
                    onClick={() => copyToClipboard(color.hex)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as typeof exportFormat)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="css">CSS Variables</option>
              <option value="scss">SCSS Variables</option>
              <option value="tailwind">Tailwind Config</option>
              <option value="json">JSON</option>
            </select>
            <button
              onClick={() => exportPalette(generatePalette())}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Export & Copy
            </button>
          </div>

          <div className="grid grid-cols-5 gap-4">
            {generatePalette().map((color, i) => (
              <div key={i} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div
                  className="w-full h-20 rounded-lg mb-2 border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-center">
                  <div className="font-mono text-sm font-bold text-gray-900 dark:text-white">{color.hex.toUpperCase()}</div>
                  <button
                    onClick={() => {
                      handleHexChange(color.hex);
                      setActiveTab('picker');
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Shades */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Shades (Lightness Scale)</h3>
            <div className="flex h-16 rounded-lg overflow-hidden">
              {generateShades().map((shade, i) => (
                <div
                  key={i}
                  className="flex-1 cursor-pointer"
                  style={{ backgroundColor: rgbToHex(shade.r, shade.g, shade.b) }}
                  onClick={() => handleHexChange(rgbToHex(shade.r, shade.g, shade.b))}
                  title={rgbToHex(shade.r, shade.g, shade.b).toUpperCase()}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Recent Colors</h3>
          <div className="flex flex-wrap gap-4">
            {history.map((color, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleHexChange(color.hex)}
              >
                <div
                  className="w-8 h-8 rounded border border-gray-200"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{color.hex.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
