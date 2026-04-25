'use client';

import { useState, useCallback } from 'react';

interface ColorStop {
  color: string;
  position: number;
}

export default function GradientGenerator() {
  const [type, setType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#3B82F6', position: 0 },
    { color: '#8B5CF6', position: 100 },
  ]);

  const addColorStop = () => {
    setColorStops([...colorStops, { color: '#10B981', position: 50 }]);
  };

  const removeColorStop = (index: number) => {
    if (colorStops.length > 2) {
      setColorStops(colorStops.filter((_, i) => i !== index));
    }
  };

  const updateColorStop = (index: number, field: keyof ColorStop, value: string | number) => {
    const newStops = [...colorStops];
    newStops[index] = { ...newStops[index], [field]: value };
    setColorStops(newStops);
  };

  const generateGradient = () => {
    const stops = colorStops
      .sort((a, b) => a.position - b.position)
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${stops})`;
    } else {
      return `radial-gradient(circle, ${stops})`;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`background: ${generateGradient()};`);
  };

  const presets = [
    { name: 'Ocean', colors: ['#3B82F6', '#06B6D4'] },
    { name: 'Sunset', colors: ['#F59E0B', '#EF4444', '#8B5CF6'] },
    { name: 'Forest', colors: ['#10B981', '#059669', '#047857'] },
    { name: 'Berry', colors: ['#EC4899', '#8B5CF6'] },
    { name: 'Midnight', colors: ['#1E3A8A', '#1E40AF', '#3B82F6'] },
  ];

  const applyPreset = (colors: string[]) => {
    const stops = colors.map((color, i) => ({
      color,
      position: Math.round((i / (colors.length - 1)) * 100),
    }));
    setColorStops(stops);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gradient Generator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create beautiful CSS gradients for your projects.
        </p>
      </div>

      {/* Gradient Preview */}
      <div className="mb-6">
        <div
          className="w-full h-64 rounded-xl border border-gray-200 dark:border-gray-700"
          style={{ background: generateGradient() }}
        />
      </div>

      {/* CSS Output */}
      <div className="mb-6 p-4 bg-gray-900 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">CSS</span>
          <button
            onClick={copyToClipboard}
            className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          >
            Copy CSS
          </button>
        </div>
        <code className="block text-green-400 font-mono text-sm break-all">
          background: {generateGradient()};
        </code>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setType('linear')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  type === 'linear'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Linear
              </button>
              <button
                onClick={() => setType('radial')}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  type === 'radial'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Radial
              </button>
            </div>
          </div>

          {type === 'linear' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Angle: {angle}°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Stops
            </label>
            <div className="space-y-2">
              {colorStops.map((stop, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={stop.position}
                    onChange={(e) => updateColorStop(index, 'position', parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {stop.position}%
                  </span>
                  <button
                    onClick={() => removeColorStop(index)}
                    disabled={colorStops.length <= 2}
                    className="px-2 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addColorStop}
              className="mt-2 w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              + Add Color Stop
            </button>
          </div>
        </div>

        {/* Presets */}
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Presets
          </h3>
          <div className="space-y-3">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset.colors)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  className="w-16 h-10 rounded-lg"
                  style={{
                    background: `linear-gradient(90deg, ${preset.colors.join(', ')})`,
                  }}
                />
                <span className="text-gray-700 dark:text-gray-300">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
