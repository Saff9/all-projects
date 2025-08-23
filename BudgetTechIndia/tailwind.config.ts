import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#06080F',
          light: '#0B0F19',
          dark: '#030408',
        },
        slate: {
          DEFAULT: '#0F172A',
          light: '#1E293B',
          dark: '#0A0F1D',
        },
        gold: {
          DEFAULT: '#FFB800',
          light: '#FFE500',
          dark: '#FF7A00',
        },
        cyan: {
          DEFAULT: '#00F5A0',
          light: '#3BFFB6',
          dark: '#00D084',
        },
        primary: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#FFB800',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px rgba(255, 184, 0, 0.35)',
        'glow-cyan': '0 0 25px rgba(0, 245, 160, 0.35)',
        'card-dark': '0 4px 20px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 16px 36px rgba(0, 0, 0, 0.75), 0 0 25px rgba(255, 184, 0, 0.18)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
