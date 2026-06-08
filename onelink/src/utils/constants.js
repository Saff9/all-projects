// App Constants
export const APP_NAME = 'OneLink'
export const APP_URL = 'https://onelink.app'
export const APP_DESCRIPTION = 'Your personalized link-in-bio page'

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  EDITOR: '/editor',
  ANALYTICS: '/analytics',
  TEMPLATES: '/templates',
  SETTINGS: '/settings',
  PROFILE: '/:username'
}

// Subscription Plans
export const PLANS = {
  FREE: 'free',
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
}

// Plan Features
export const PLAN_FEATURES = {
  [PLANS.FREE]: {
    name: 'Free',
    price: 0,
    features: {
      maxLinks: 10,
      customDomain: false,
      analytics: true,
      templates: 'free',
      customCSS: false,
      animatedBackgrounds: ['particles', 'gradient'],
      qrCode: true,
      support: 'email'
    }
  },
  [PLANS.PRO]: {
    name: 'Pro',
    price: 9.99,
    features: {
      maxLinks: 50,
      customDomain: true,
      analytics: true,
      templates: 'all',
      customCSS: true,
      animatedBackgrounds: 'all',
      qrCode: true,
      support: 'priority',
      scheduling: true,
      prioritySupport: true
    }
  },
  [PLANS.ENTERPRISE]: {
    name: 'Enterprise',
    price: 29.99,
    features: {
      maxLinks: 'unlimited',
      customDomain: true,
      analytics: true,
      templates: 'all',
      customCSS: true,
      animatedBackgrounds: 'all',
      qrCode: true,
      support: 'dedicated',
      scheduling: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true
    }
  }
}

// Social Platforms
export const SOCIAL_PLATFORMS = {
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    baseUrl: 'https://instagram.com/',
    color: '#E4405F'
  },
  twitter: {
    name: 'Twitter',
    icon: 'twitter',
    baseUrl: 'https://twitter.com/',
    color: '#1DA1F2'
  },
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    baseUrl: 'https://youtube.com/',
    color: '#FF0000'
  },
  tiktok: {
    name: 'TikTok',
    icon: 'tiktok',
    baseUrl: 'https://tiktok.com/@',
    color: '#000000'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: 'linkedin',
    baseUrl: 'https://linkedin.com/in/',
    color: '#0A66C2'
  },
  github: {
    name: 'GitHub',
    icon: 'github',
    baseUrl: 'https://github.com/',
    color: '#181717'
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook',
    baseUrl: 'https://facebook.com/',
    color: '#1877F2'
  },
  email: {
    name: 'Email',
    icon: 'mail',
    baseUrl: 'mailto:',
    color: '#EA4335'
  }
}

// Link Types
export const LINK_TYPES = {
  LINK: 'link',
  EMAIL: 'email',
  PHONE: 'phone',
  SOCIAL: 'social',
  FILE: 'file'
}

// Template Categories
export const TEMPLATE_CATEGORIES = {
  MINIMAL: 'minimal',
  CREATIVE: 'creative',
  PROFESSIONAL: 'professional',
  BOLD: 'bold',
  ELEGANT: 'elegant'
}

// Available Templates
export const TEMPLATES = {
  MINIMAL: 'minimal',
  GRADIENT: 'gradient',
  DARK: 'dark',
  NEON: 'neon',
  PROFESSIONAL: 'professional',
  GLASS: 'glass',
  NEONGLOW: 'neonglow',
  CARD: 'card',
  SPLIT: 'split',
  ANIMATED: 'animated'
}

// Template Metadata
export const TEMPLATE_METADATA = {
  [TEMPLATES.MINIMAL]: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and simple design',
    category: TEMPLATE_CATEGORIES.MINIMAL,
    isPremium: false,
  },
  [TEMPLATES.GRADIENT]: {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradient backgrounds',
    category: TEMPLATE_CATEGORIES.CREATIVE,
    isPremium: false,
  },
  [TEMPLATES.DARK]: {
    id: 'dark',
    name: 'Dark',
    description: 'Dark mode focused design',
    category: TEMPLATE_CATEGORIES.BOLD,
    isPremium: false,
  },
  [TEMPLATES.NEON]: {
    id: 'neon',
    name: 'Neon',
    description: 'Neon glow effects',
    category: TEMPLATE_CATEGORIES.CREATIVE,
    isPremium: false,
  },
  [TEMPLATES.PROFESSIONAL]: {
    id: 'professional',
    name: 'Professional',
    description: 'Business professional look',
    category: TEMPLATE_CATEGORIES.PROFESSIONAL,
    isPremium: false,
  },
  [TEMPLATES.GLASS]: {
    id: 'glass',
    name: 'Glass',
    description: 'Glassmorphism effect with blur',
    category: TEMPLATE_CATEGORIES.CREATIVE,
    isPremium: true,
  },
  [TEMPLATES.NEONGLOW]: {
    id: 'neonglow',
    name: 'Neon Glow',
    description: 'Intense neon glow effects',
    category: TEMPLATE_CATEGORIES.BOLD,
    isPremium: true,
  },
  [TEMPLATES.CARD]: {
    id: 'card',
    name: 'Card',
    description: 'Card-based grid layout',
    category: TEMPLATE_CATEGORIES.PROFESSIONAL,
    isPremium: true,
  },
  [TEMPLATES.SPLIT]: {
    id: 'split',
    name: 'Split',
    description: 'Split screen design',
    category: TEMPLATE_CATEGORIES.BOLD,
    isPremium: true,
  },
  [TEMPLATES.ANIMATED]: {
    id: 'animated',
    name: 'Animated',
    description: 'Heavy animations and effects',
    category: TEMPLATE_CATEGORIES.CREATIVE,
    isPremium: true,
  },
}

// Animation Types
export const ANIMATION_TYPES = {
  NONE: 'none',
  PARTICLES: 'particles',
  GRADIENT: 'gradient',
  WAVES: 'waves'
}

// Button Styles
export const BUTTON_STYLES = {
  ROUNDED: 'rounded',
  SQUARE: 'square',
  PILL: 'pill'
}

// Avatar Shapes
export const AVATAR_SHAPES = {
  CIRCLE: 'circle',
  SQUARE: 'square',
  ROUNDED: 'rounded'
}

// Link Layouts
export const LINK_LAYOUTS = {
  STACKED: 'stacked',
  GRID: 'grid',
  CAROUSEL: 'carousel'
}

// Default Theme Settings
export const DEFAULT_THEME = {
  primaryColor: '#0ea5e9',
  secondaryColor: '#d946ef',
  backgroundColor: '#ffffff',
  textColor: '#1f2937',
  fontFamily: 'Inter',
  buttonStyle: BUTTON_STYLES.ROUNDED,
  animationType: ANIMATION_TYPES.NONE
}

// Default Profile Settings
export const DEFAULT_PROFILE = {
  displayName: '',
  bio: '',
  avatarURL: null,
  coverImageURL: null,
  templateId: null,
  themeSettings: DEFAULT_THEME,
  socialLinks: {
    instagram: null,
    twitter: null,
    youtube: null,
    tiktok: null,
    linkedin: null,
    github: null,
    facebook: null,
    email: null
  },
  seoSettings: {
    title: '',
    description: '',
    ogImageURL: null
  }
}

// Analytics Date Ranges
export const DATE_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  LAST_90_DAYS: 'last90days',
  CUSTOM: 'custom'
}

// Error Messages
export const ERROR_MESSAGES = {
  USERNAME_TAKEN: 'This username is already taken',
  USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  USERNAME_TOO_LONG: 'Username cannot exceed 20 characters',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  LINK_LIMIT_REACHED: 'You have reached the maximum number of links for your plan',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  NETWORK_ERROR: 'A network error occurred. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  LINK_CREATED: 'Link created successfully',
  LINK_UPDATED: 'Link updated successfully',
  LINK_DELETED: 'Link deleted successfully',
  PROFILE_PUBLISHED: 'Your profile is now live!',
  SETTINGS_SAVED: 'Settings saved successfully',
  PASSWORD_RESET: 'Password reset email sent',
  EMAIL_VERIFIED: 'Email verified successfully'
}

// Validation Patterns
export const VALIDATION_PATTERNS = {
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  PHONE: /^\+?[\d\s-]{10,}$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'onelink_theme',
  SIDEBAR_STATE: 'onelink_sidebar',
  RECENT_PROFILES: 'onelink_recent_profiles'
}

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
}

// Device Types
export const DEVICE_TYPES = {
  MOBILE: 'mobile',
  TABLET: 'tablet',
  DESKTOP: 'desktop'
}

// Default Avatar URL
export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

// Max File Sizes (in bytes)
export const MAX_FILE_SIZES = {
  AVATAR: 2 * 1024 * 1024, // 2MB
  COVER: 5 * 1024 * 1024, // 5MB
  LINK_ICON: 500 * 1024 // 500KB
}

// Allowed File Types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}