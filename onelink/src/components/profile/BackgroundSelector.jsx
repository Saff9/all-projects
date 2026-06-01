import { useState } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, X, Check, Sparkles } from 'lucide-react';
import Button from '../ui/Button';

const BackgroundSelector = ({
  background,
  onChange,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('colors');

  const solidColors = [
    { id: 'white', value: '#ffffff', name: 'White' },
    { id: 'gray-50', value: '#f9fafb', name: 'Light Gray' },
    { id: 'gray-900', value: '#111827', name: 'Dark' },
    { id: 'black', value: '#000000', name: 'Black' },
    { id: 'primary-50', value: '#f0f9ff', name: 'Light Blue' },
    { id: 'primary-900', value: '#0c4a6e', name: 'Dark Blue' },
  ];

  const gradients = [
    { id: 'sunset', value: 'linear-gradient(135deg, #f97316 0%, #ec4899 50%, #8b5cf6 100%)', name: 'Sunset' },
    { id: 'ocean', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)', name: 'Ocean' },
    { id: 'forest', value: 'linear-gradient(135deg, #22c55e 0%, #14b8a6 50%, #06b6d4 100%)', name: 'Forest' },
    { id: 'aurora', value: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f43f5e 100%)', name: 'Aurora' },
    { id: 'midnight', value: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)', name: 'Midnight' },
    { id: 'peach', value: 'linear-gradient(135deg, #fbbf24 0%, #f97316 50%, #ef4444 100%)', name: 'Peach' },
  ];

  const patterns = [
    { id: 'dots', name: 'Dots', pattern: 'radial-gradient(circle, #000 1px, transparent 1px)', size: '20px 20px' },
    { id: 'grid', name: 'Grid', pattern: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', size: '20px 20px' },
    { id: 'diagonal', name: 'Diagonal', pattern: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)', size: '10px 10px' },
  ];

  const handleSelect = (type, value, extra = {}) => {
    onChange?.({ type, value, ...extra });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleSelect('image', event.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'colors', label: 'Colors' },
    { id: 'gradients', label: 'Gradients' },
    { id: 'patterns', label: 'Patterns' },
    { id: 'image', label: 'Image' },
  ];

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Image className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Background
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Solid Colors */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-3 gap-3">
            {solidColors.map((color) => (
              <motion.button
                key={color.id}
                onClick={() => handleSelect('solid', color.value)}
                className={`
                  relative aspect-square rounded-xl border-2 transition-all
                  ${background?.value === color.value
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                  }
                `}
                style={{ backgroundColor: color.value }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {background?.value === color.value && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <Check className={`w-5 h-5 ${color.value === '#ffffff' || color.value === '#f9fafb' ? 'text-gray-900' : 'text-white'}`} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Gradients */}
        {activeTab === 'gradients' && (
          <div className="grid grid-cols-2 gap-3">
            {gradients.map((gradient) => (
              <motion.button
                key={gradient.id}
                onClick={() => handleSelect('gradient', gradient.value)}
                className={`
                  relative aspect-video rounded-xl border-2 transition-all overflow-hidden
                  ${background?.value === gradient.value
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                  }
                `}
                style={{ background: gradient.value }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {background?.value === gradient.value && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                )}
                <span className="absolute bottom-1 left-2 text-xs text-white font-medium drop-shadow">
                  {gradient.name}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Patterns */}
        {activeTab === 'patterns' && (
          <div className="grid grid-cols-3 gap-3">
            {patterns.map((pattern) => (
              <motion.button
                key={pattern.id}
                onClick={() => handleSelect('pattern', pattern.pattern, { size: pattern.size })}
                className={`
                  relative aspect-square rounded-xl border-2 transition-all
                  ${background?.value === pattern.pattern
                    ? 'border-primary-500 ring-2 ring-primary-500/20'
                    : 'border-gray-200 dark:border-gray-700'
                  }
                `}
                style={{
                  backgroundImage: pattern.pattern,
                  backgroundSize: pattern.size,
                  backgroundColor: '#f9fafb',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {background?.value === pattern.pattern && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50">
                    <Check className="w-5 h-5 text-gray-900" />
                  </div>
                )}
                <span className="absolute bottom-1 left-1 right-1 text-xs text-gray-600 font-medium text-center">
                  {pattern.name}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Image Upload */}
        {activeTab === 'image' && (
          <div className="space-y-4">
            {background?.type === 'image' ? (
              <div className="relative">
                <div
                  className="aspect-video rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${background.value})` }}
                />
                <button
                  onClick={() => onChange?.(null)}
                  className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded-full shadow-lg"
                >
                  <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Background Preview Component
export const BackgroundPreview = ({
  background,
  className = '',
}) => {
  if (!background) return null;

  const getBackgroundStyle = () => {
    switch (background.type) {
      case 'solid':
        return { backgroundColor: background.value };
      case 'gradient':
        return { background: background.value };
      case 'pattern':
        return {
          backgroundImage: background.value,
          backgroundSize: background.size || '20px 20px',
          backgroundColor: '#f9fafb',
        };
      case 'image':
        return { backgroundImage: `url(${background.value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      default:
        return {};
    }
  };

  return (
    <div
      className={`rounded-xl ${className}`}
      style={getBackgroundStyle()}
    />
  );
};

export default BackgroundSelector;