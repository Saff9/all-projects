// components/ThemeIndicator.tsx
'use client';

interface ThemeIndicatorProps {
  weatherCondition: string;
  temperature: number;
}

export default function ThemeIndicator({ weatherCondition, temperature }: ThemeIndicatorProps) {
  const getThemeInfo = () => {
    const condition = weatherCondition.toLowerCase();
    
    if (condition.includes('sunny') || condition.includes('clear')) {
      return { emoji: '☀️', message: 'Bright & Sunny Theme Active' };
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return { emoji: '🌧️', message: 'Cool & Rainy Theme Active' };
    } else if (condition.includes('snow') || condition.includes('sleet')) {
      return { emoji: '❄️', message: 'Winter Wonderland Theme Active' };
    } else if (condition.includes('cloud')) {
      return { emoji: '☁️', message: 'Soft & Cloudy Theme Active' };
    } else if (condition.includes('storm') || condition.includes('thunder')) {
      return { emoji: '⛈️', message: 'Stormy Weather Theme Active' };
    } else {
      return { emoji: '🌈', message: 'Dynamic Theme Active' };
    }
  };

  const themeInfo = getThemeInfo();

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{themeInfo.emoji}</span>
          <div>
            <p className="text-sm font-semibold text-kashmir-light-neutral-700 dark:text-kashmir-dark-neutral-300">
              Dynamic Theme
            </p>
            <p className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
              {themeInfo.message}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-kashmir-light-blue-600 dark:text-kashmir-dark-blue-400">
            Auto
          </p>
          <p className="text-xs text-kashmir-light-neutral-500 dark:text-kashmir-dark-neutral-500">
            AI Powered
          </p>
        </div>
      </div>
    </div>
  );
}
