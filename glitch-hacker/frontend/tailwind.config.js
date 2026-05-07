/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        primary: '#00FF41',
        alert: '#FF3333',
        surface: '#1A1A1A',
        'surface-light': '#2A2A2A',
        'primary-dark': '#00CC33',
        'primary-glow': 'rgba(0, 255, 65, 0.3)',
        'alert-glow': 'rgba(255, 51, 51, 0.3)',
      },
      fontFamily: {
        mono: ['Fira Code', 'Courier Prime', 'Courier New', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 1s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #00FF41, 0 0 10px #00FF41' },
          '50%': { boxShadow: '0 0 20px #00FF41, 0 0 30px #00FF41' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
