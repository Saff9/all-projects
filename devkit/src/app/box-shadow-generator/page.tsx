'use client';

import { useState, useMemo } from 'react';

interface ShadowLayer {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
}

const PRESET_SHADOWS = [
  { name: 'None', shadows: [] },
  { name: 'Small', shadows: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.1)', inset: false }] },
  { name: 'Medium', shadows: [{ x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', inset: false }] },
  { name: 'Large', shadows: [{ x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)', inset: false }] },
  { name: 'Inner', shadows: [{ x: 0, y: 2, blur: 5, spread: 0, color: 'rgba(0,0,0,0.1)', inset: true }] },
  { name: 'Elevated', shadows: [{ x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.2)', inset: false }] },
  { name: 'Glow', shadows: [{ x: 0, y: 0, blur: 20, spread: 5, color: 'rgba(66, 153, 225, 0.5)', inset: false }] },
  { name: 'Inset Glow', shadows: [{ x: 0, y: 0, blur: 10, spread: 5, color: 'rgba(66, 153, 225, 0.3)', inset: true }] },
];

export default function BoxShadowGenerator() {
  const [shadows, setShadows] = useState<ShadowLayer[]>([
    { x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)', inset: false },
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [boxColor, setBoxColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#f3f4f6');

  const currentShadow = shadows[selectedIndex];

  const cssCode = useMemo(() => {
    if (shadows.length === 0) return 'none';
    return shadows
      .map((s) => `${s.inset ? 'inset ' : ''}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`)
      .join(',\n  ');
  }, [shadows]);

  const fullCssCode = useMemo(() => {
    return `box-shadow: ${cssCode};`;
  }, [cssCode]);

  const addShadow = () => {
    setShadows([...shadows, { x: 0, y: 4, blur: 6, spread: 0, color: 'rgba(0,0,0,0.2)', inset: false }]);
    setSelectedIndex(shadows.length);
  };

  const removeShadow = () => {
    if (shadows.length > 1) {
      const newShadows = shadows.filter((_, i) => i !== selectedIndex);
      setShadows(newShadows);
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    }
  };

  const updateShadow = (updates: Partial<ShadowLayer>) => {
    setShadows(shadows.map((s, i) => (i === selectedIndex ? { ...s, ...updates } : s)));
  };

  const applyPreset = (preset: typeof PRESET_SHADOWS[number]) => {
    setShadows(preset.shadows.map((s) => ({ ...s, color: s.color as string })));
    setSelectedIndex(0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const hexToRgba = (hex: string, alpha: number = 1) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return hex;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Box Shadow Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create beautiful CSS box shadows with visual controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-6">
          {/* Presets */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Presets</h3>
            <div className="flex flex-wrap gap-2">
              {PRESET_SHADOWS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Shadow Layers */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shadow Layers</h3>
              <button
                onClick={addShadow}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Layer
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {shadows.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    selectedIndex === i
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Layer {i + 1}
                </button>
              ))}
            </div>

            {currentShadow && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentShadow.inset}
                      onChange={(e) => updateShadow({ inset: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Inset</span>
                  </label>
                  <button
                    onClick={removeShadow}
                    disabled={shadows.length === 1}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Remove Layer
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      X Offset: {currentShadow.x}px
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentShadow.x}
                      onChange={(e) => updateShadow({ x: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Y Offset: {currentShadow.y}px
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentShadow.y}
                      onChange={(e) => updateShadow({ y: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Blur: {currentShadow.blur}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentShadow.blur}
                      onChange={(e) => updateShadow({ blur: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Spread: {currentShadow.spread}px
                    </label>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      value={currentShadow.spread}
                      onChange={(e) => updateShadow({ spread: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={currentShadow.color.startsWith('#') ? currentShadow.color : '#000000'}
                      onChange={(e) => updateShadow({ color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentShadow.color}
                      onChange={(e) => updateShadow({ color: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Code */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated CSS</h3>
              <button
                onClick={() => copyToClipboard(fullCssCode)}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg overflow-x-auto">
              <code className="text-sm font-mono text-gray-900 dark:text-gray-100">{fullCssCode}</code>
            </pre>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Preview</h3>
            <div
              className="w-full h-64 rounded-lg flex items-center justify-center"
              style={{ backgroundColor }}
            >
              <div
                className="w-48 h-48 rounded-lg"
                style={{
                  backgroundColor: boxColor,
                  boxShadow: cssCode === 'none' ? 'none' : cssCode.replace(/,\n  /g, ', '),
                }}
              />
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Box Color
                </label>
                <input
                  type="color"
                  value={boxColor}
                  onChange={(e) => setBoxColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Background
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
