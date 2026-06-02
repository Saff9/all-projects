import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Palette, Eye } from 'lucide-react';
import { templateConfigs } from '../templates';

const ThemeSelector = ({
  selectedTheme,
  onSelect,
  className = '',
}) => {
  const [previewTheme, setPreviewTheme] = useState(null);

  const themes = Object.values(templateConfigs);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Choose Theme
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            onClick={() => onSelect?.(theme.id)}
            className={`
              relative group
              rounded-xl overflow-hidden
              border-2 transition-all
              ${selectedTheme === theme.id
                ? 'border-primary-500 ring-2 ring-primary-500/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setPreviewTheme(theme.id)}
            onMouseLeave={() => setPreviewTheme(null)}
          >
            {/* Preview Image */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
              {/* Placeholder preview - would be replaced with actual preview images */}
              <div className={`absolute inset-0 ${getThemeGradient(theme.id)}`} />
              
              {/* Selected indicator */}
              {selectedTheme === theme.id && (
                <motion.div
                  className="absolute top-2 right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              )}

              {/* Preview button */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-900 flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  Preview
                </span>
              </div>
            </div>

            {/* Info */}
            <div className="p-3 bg-white dark:bg-gray-800">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {theme.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {theme.description}
              </p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

// Helper function to get theme gradient for preview
const getThemeGradient = (themeId) => {
  const gradients = {
    minimal: 'bg-white',
    gradient: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600',
    dark: 'bg-gray-900',
    neon: 'bg-gray-900',
    professional: 'bg-gradient-to-br from-slate-50 to-slate-100',
  };
  return gradients[themeId] || 'bg-gray-100';
};

// Theme Selector Compact (for sidebar)
export const ThemeSelectorCompact = ({
  selectedTheme,
  onSelect,
  className = '',
}) => {
  const themes = Object.values(templateConfigs);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {themes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onSelect?.(theme.id)}
          className={`
            px-3 py-1.5 rounded-lg text-sm font-medium
            transition-all
            ${selectedTheme === theme.id
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
          `}
        >
          {theme.name}
        </button>
      ))}
    </div>
  );
};

// Theme Preview Card
export const ThemePreviewCard = ({
  theme,
  isSelected,
  onSelect,
  className = '',
}) => {
  return (
    <motion.div
      className={`
        relative rounded-xl overflow-hidden cursor-pointer
        border-2 transition-all
        ${isSelected
          ? 'border-primary-500 ring-2 ring-primary-500/20'
          : 'border-gray-200 dark:border-gray-700'
        }
        ${className}
      `}
      onClick={() => onSelect?.(theme.id)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`aspect-video ${getThemeGradient(theme.id)}`}>
        {isSelected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      <div className="p-2 bg-white dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-900 dark:text-white">
          {theme.name}
        </p>
      </div>
    </motion.div>
  );
};

export default ThemeSelector;