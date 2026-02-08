export interface UserSettings {
  allowDataTraining: boolean;
  apiKeys: {
    groq: string;
    huggingface: string;
    openrouter: string;
    search: string;
  };
  theme: 'light' | 'dark' | 'system';
  colorTheme: 'default' | 'ocean' | 'forest' | 'sunset' | 'lavender' | 'midnight';
  fontFamily: 'inter' | 'sora' | 'poppins' | 'nunito' | 'quicksand' | 'outfit';
  vibrationEnabled: boolean;
  userId: string;
}

export interface RateLimitData {
  count: number;
  date: string;
  limit: number;
}

const DEFAULT_SETTINGS: UserSettings = {
  allowDataTraining: false,
  apiKeys: {
    groq: '',
    huggingface: '',
    openrouter: '',
    search: '',
  },
  theme: 'system',
  colorTheme: 'default',
  fontFamily: 'inter',
  vibrationEnabled: true,
  userId: '',
};

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getSettings(): UserSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  const stored = localStorage.getItem('apex-settings');
  if (!stored) {
    const newSettings = { ...DEFAULT_SETTINGS, userId: generateUserId() };
    localStorage.setItem('apex-settings', JSON.stringify(newSettings));
    return newSettings;
  }
  
  try {
    const parsed = JSON.parse(stored);
    if (!parsed.userId) {
      parsed.userId = generateUserId();
      localStorage.setItem('apex-settings', JSON.stringify(parsed));
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS, userId: generateUserId() };
  }
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('apex-settings', JSON.stringify(settings));
}

export function getRateLimitData(): RateLimitData {
  if (typeof window === 'undefined') return { count: 0, date: new Date().toDateString(), limit: 70 };
  
  const stored = localStorage.getItem('apex-ratelimit');
  const today = new Date().toDateString();
  
  if (!stored) {
    const data = { count: 0, date: today, limit: 70 };
    localStorage.setItem('apex-ratelimit', JSON.stringify(data));
    return data;
  }
  
  try {
    const parsed = JSON.parse(stored);
    if (parsed.date !== today) {
      const data = { count: 0, date: today, limit: 70 };
      localStorage.setItem('apex-ratelimit', JSON.stringify(data));
      return data;
    }
    return parsed;
  } catch {
    return { count: 0, date: today, limit: 70 };
  }
}

export function incrementRateLimit(): RateLimitData {
  const current = getRateLimitData();
  const updated = { ...current, count: current.count + 1 };
  localStorage.setItem('apex-ratelimit', JSON.stringify(updated));
  return updated;
}

export function isRateLimited(): boolean {
  const data = getRateLimitData();
  return data.count >= data.limit;
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('apex-conversations');
  localStorage.removeItem('apex-settings');
  localStorage.removeItem('apex-ratelimit');
}

export function triggerVibration(pattern: number | number[] = 50): void {
  if (typeof window === 'undefined') return;
  const settings = getSettings();
  if (!settings.vibrationEnabled) return;
  
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
    }
  }
}

export const COLOR_THEMES = {
  default: {
    name: 'Default Blue',
    description: 'Calm blue tones',
    light: {
      primary: 'oklch(0.55 0.15 220)',
      accent: 'oklch(0.88 0.05 180)',
    },
    dark: {
      primary: 'oklch(0.7 0.12 220)',
      accent: 'oklch(0.35 0.05 220)',
    },
  },
  ocean: {
    name: 'Ocean Calm',
    description: 'Deep sea blues - very low UV',
    light: {
      primary: 'oklch(0.5 0.1 200)',
      accent: 'oklch(0.85 0.04 190)',
    },
    dark: {
      primary: 'oklch(0.6 0.08 200)',
      accent: 'oklch(0.3 0.04 200)',
    },
  },
  forest: {
    name: 'Forest Green',
    description: 'Natural green tones - easy on eyes',
    light: {
      primary: 'oklch(0.5 0.12 150)',
      accent: 'oklch(0.85 0.05 150)',
    },
    dark: {
      primary: 'oklch(0.6 0.1 150)',
      accent: 'oklch(0.3 0.05 150)',
    },
  },
  sunset: {
    name: 'Warm Sunset',
    description: 'Warm amber tones - reduces blue light',
    light: {
      primary: 'oklch(0.6 0.15 50)',
      accent: 'oklch(0.9 0.06 60)',
    },
    dark: {
      primary: 'oklch(0.7 0.12 50)',
      accent: 'oklch(0.35 0.06 50)',
    },
  },
  lavender: {
    name: 'Soft Lavender',
    description: 'Gentle purple - soothing',
    light: {
      primary: 'oklch(0.55 0.12 280)',
      accent: 'oklch(0.88 0.04 280)',
    },
    dark: {
      primary: 'oklch(0.65 0.1 280)',
      accent: 'oklch(0.32 0.05 280)',
    },
  },
  midnight: {
    name: 'Midnight',
    description: 'Ultra dark - minimum light emission',
    light: {
      primary: 'oklch(0.45 0.08 250)',
      accent: 'oklch(0.8 0.03 250)',
    },
    dark: {
      primary: 'oklch(0.55 0.06 250)',
      accent: 'oklch(0.25 0.03 250)',
    },
  },
};

export const FONT_OPTIONS = {
  inter: {
    name: 'Inter',
    description: 'Clean & Modern',
    import: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    family: "'Inter', sans-serif",
  },
  sora: {
    name: 'Sora',
    description: 'Geometric & Bold',
    import: 'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&display=swap',
    family: "'Sora', sans-serif",
  },
  poppins: {
    name: 'Poppins',
    description: 'Friendly & Round',
    import: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    family: "'Poppins', sans-serif",
  },
  nunito: {
    name: 'Nunito',
    description: 'Soft & Warm',
    import: 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700&display=swap',
    family: "'Nunito', sans-serif",
  },
  quicksand: {
    name: 'Quicksand',
    description: 'Playful & Light',
    import: 'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap',
    family: "'Quicksand', sans-serif",
  },
  outfit: {
    name: 'Outfit',
    description: 'Sleek & Professional',
    import: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    family: "'Outfit', sans-serif",
  },
};
