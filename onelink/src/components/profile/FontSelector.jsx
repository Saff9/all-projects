import { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, Check } from 'lucide-react';

const FontSelector = ({
  selectedFont,
  onSelect,
  className = '',
}) => {
  const [previewText, setPreviewText] = useState('The quick brown fox');

  const fonts = [
    { id: 'inter', name: 'Inter', family: 'Inter, sans-serif', category: 'Sans-serif' },
    { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', category: 'Sans-serif' },
    { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', category: 'Sans-serif' },
    { id: 'opensans', name: 'Open Sans', family: 'Open Sans, sans-serif', category: 'Sans-serif' },
    { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', category: 'Sans-serif' },
    { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'Sans-serif' },
    { id: 'playfair', name: 'Playfair Display', family: 'Playfair Display, serif', category: 'Serif' },
    { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif', category: 'Serif' },
    { id: 'lora', name: 'Lora', family: 'Lora, serif', category: 'Serif' },
    { id: 'fira-code', name: 'Fira Code', family: 'Fira Code, monospace', category: 'Monospace' },
    { id: 'jetbrains', name: 'JetBrains Mono', family: 'JetBrains Mono, monospace', category: 'Monospace' },
    { id: 'dancing', name: 'Dancing Script', family: 'Dancing Script, cursive', category: 'Cursive' },
  ];

  const categories = ['All', 'Sans-serif', 'Serif', 'Monospace', 'Cursive'];
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredFonts = activeCategory === 'All'
    ? fonts
    : fonts.filter((font) => font.category === activeCategory);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Font Family
        </h3>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeCategory === category
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Preview Text Input */}
      <div className="mb-4">
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Preview text..."
          className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Font List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {filteredFonts.map((font) => (
          <motion.button
            key={font.id}
            onClick={() => onSelect?.(font.family)}
            className={`
              w-full p-4 rounded-xl border-2 text-left transition-all
              ${selectedFont === font.family
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p
                  className="text-lg font-medium text-gray-900 dark:text-white mb-1"
                  style={{ fontFamily: font.family }}
                >
                  {previewText}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {font.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {font.category}
                  </span>
                </div>
              </div>
              {selectedFont === font.family && (
                <Check className="w-5 h-5 text-primary-500 flex-shrink-0" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Font Size Selector
export const FontSizeSelector = ({
  size,
  onChange,
  min = 12,
  max = 32,
  className = '',
}) => {
  const sizes = [12, 14, 16, 18, 20, 24, 28, 32];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Font Size
      </label>

      <div className="flex items-center gap-4">
        {/* Slider */}
        <input
          type="range"
          min={min}
          max={max}
          value={size}
          onChange={(e) => onChange?.(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
        />

        {/* Value Display */}
        <div className="w-12 text-center">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {size}px
          </span>
        </div>
      </div>

      {/* Preset Sizes */}
      <div className="flex gap-2 mt-3">
        {sizes.map((presetSize) => (
          <button
            key={presetSize}
            onClick={() => onChange?.(presetSize)}
            className={`
              px-2 py-1 text-xs rounded-md transition-colors
              ${size === presetSize
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            {presetSize}
          </button>
        ))}
      </div>
    </div>
  );
};

// Font Weight Selector
export const FontWeightSelector = ({
  weight,
  onChange,
  className = '',
}) => {
  const weights = [
    { value: 300, label: 'Light' },
    { value: 400, label: 'Regular' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semibold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extrabold' },
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Font Weight
      </label>

      <div className="grid grid-cols-3 gap-2">
        {weights.map((w) => (
          <button
            key={w.value}
            onClick={() => onChange?.(w.value)}
            className={`
              px-3 py-2 rounded-lg text-sm transition-colors
              ${weight === w.value
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
            style={{ fontWeight: w.value }}
          >
            {w.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Text Style Selector
export const TextStyleSelector = ({
  styles,
  onChange,
  className = '',
}) => {
  const { bold, italic, underline, uppercase } = styles || {};

  const toggleStyle = (style) => {
    onChange?.({ ...styles, [style]: !styles?.[style] });
  };

  const buttons = [
    { id: 'bold', label: 'B', style: 'bold', active: bold, fontWeight: 'bold' },
    { id: 'italic', label: 'I', style: 'italic', active: italic, fontStyle: 'italic' },
    { id: 'underline', label: 'U', style: 'underline', active: underline, textDecoration: 'underline' },
    { id: 'uppercase', label: 'AA', style: 'uppercase', active: uppercase, textTransform: 'uppercase' },
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Text Style
      </label>

      <div className="flex gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.id}
            onClick={() => toggleStyle(btn.style)}
            className={`
              w-10 h-10 rounded-lg text-sm font-medium transition-colors
              ${btn.active
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
            style={{
              fontWeight: btn.id === 'bold' && btn.active ? 'bold' : 'normal',
              fontStyle: btn.id === 'italic' && btn.active ? 'italic' : 'normal',
              textDecoration: btn.id === 'underline' && btn.active ? 'underline' : 'none',
              textTransform: btn.id === 'uppercase' && btn.active ? 'uppercase' : 'none',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FontSelector;