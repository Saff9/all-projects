import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pipette, RotateCcw } from 'lucide-react';

const ColorPicker = ({
  color,
  onChange,
  label,
  presetColors = defaultPresetColors,
  showInput = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(color);
  const pickerRef = useRef(null);

  useEffect(() => {
    setLocalColor(color);
  }, [color]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleColorChange = (newColor) => {
    setLocalColor(newColor);
    onChange?.(newColor);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      handleColorChange(value);
    } else {
      setLocalColor(value);
    }
  };

  return (
    <div className={className} ref={pickerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Color Preview Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 w-full p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
        >
          <div
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 shadow-inner"
            style={{ backgroundColor: localColor }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
            {localColor}
          </span>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <motion.div
            className="absolute z-50 mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 w-64"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Native Color Picker */}
            <div className="mb-4">
              <input
                type="color"
                value={localColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-24 rounded-lg cursor-pointer border-0"
              />
            </div>

            {/* Preset Colors */}
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                Preset Colors
              </p>
              <div className="grid grid-cols-8 gap-1.5">
                {presetColors.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    onClick={() => handleColorChange(presetColor)}
                    className={`
                      w-6 h-6 rounded-md border transition-transform hover:scale-110
                      ${localColor === presetColor
                        ? 'ring-2 ring-primary-500 ring-offset-1'
                        : 'border-gray-200 dark:border-gray-600'
                      }
                    `}
                    style={{ backgroundColor: presetColor }}
                  />
                ))}
              </div>
            </div>

            {/* Hex Input */}
            {showInput && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Hex Color
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={localColor}
                    onChange={handleInputChange}
                    placeholder="#000000"
                    className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleColorChange(color)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    title="Reset to original"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Default preset colors
const defaultPresetColors = [
  // Primary colors
  '#0ea5e9', '#0284c7', '#0369a1',
  '#d946ef', '#c026d3', '#a21caf',
  '#f97316', '#ea580c', '#c2410c',
  '#22c55e', '#16a34a', '#15803d',
  '#ef4444', '#dc2626', '#b91c1c',
  // Neutral colors
  '#000000', '#374151', '#6b7280',
  '#9ca3af', '#d1d5db', '#e5e7eb',
  '#f3f4f6', '#f9fafb', '#ffffff',
];

// Color Palette Component
export const ColorPalette = ({
  colors = defaultPresetColors,
  selectedColor,
  onSelect,
  columns = 8,
  className = '',
}) => {
  return (
    <div className={className}>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {colors.map((color) => (
          <motion.button
            key={color}
            type="button"
            onClick={() => onSelect?.(color)}
            className={`
              w-full aspect-square rounded-lg border transition-all
              ${selectedColor === color
                ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
                : 'border-gray-200 dark:border-gray-700 hover:scale-105'
              }
            `}
            style={{ backgroundColor: color }}
            whileHover={{ scale: selectedColor === color ? 1 : 1.1 }}
            whileTap={{ scale: 0.95 }}
          />
        ))}
      </div>
    </div>
  );
};

// Gradient Color Picker
export const GradientColorPicker = ({
  startColor,
  endColor,
  onStartChange,
  onEndChange,
  label,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3">
        {/* Start Color */}
        <ColorPicker
          color={startColor}
          onChange={onStartChange}
          presetColors={defaultPresetColors.slice(0, 12)}
        />

        {/* Gradient Preview */}
        <div
          className="flex-1 h-10 rounded-lg"
          style={{
            background: `linear-gradient(to right, ${startColor}, ${endColor})`,
          }}
        />

        {/* End Color */}
        <ColorPicker
          color={endColor}
          onChange={onEndChange}
          presetColors={defaultPresetColors.slice(0, 12)}
        />
      </div>
    </div>
  );
};

// Color Swatches (for quick selection)
export const ColorSwatches = ({
  colors = defaultPresetColors,
  selectedColor,
  onSelect,
  label,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onSelect?.(color)}
            className={`
              w-8 h-8 rounded-lg border transition-all
              ${selectedColor === color
                ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-900'
                : 'border-gray-200 dark:border-gray-700 hover:scale-105'
              }
            `}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;