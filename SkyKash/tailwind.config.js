// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        kashmir: {
          // Light mode - UV protected colors
          light: {
            blue: {
              50: '#E6F3FF',
              100: '#CCE7FF',
              200: '#99CFFF',
              300: '#66B7FF',
              400: '#339FFF',
              500: '#0088FF', // Primary blue
              600: '#0066CC',
              700: '#004499',
              800: '#002266',
              900: '#001133',
            },
            green: {
              50: '#F0FFF4',
              100: '#E6FFED',
              200: '#CCFFDB',
              300: '#99FFB8',
              400: '#66FF94',
              500: '#33FF70', // Primary green
              600: '#00CC4D',
              700: '#00993A',
              800: '#006627',
              900: '#003314',
            },
            neutral: {
              50: '#FAFAFA',
              100: '#F5F5F5',
              200: '#E5E5E5',
              300: '#D4D4D4',
              400: '#A3A3A3',
              500: '#737373',
              600: '#525252',
              700: '#404040',
              800: '#262626',
              900: '#171717',
            }
          },
          // Dark mode - Reduced blue light
          dark: {
            blue: {
              50: '#0A1A2F',
              100: '#0F2545',
              200: '#1A365D',
              300: '#2D4A76',
              400: '#3D5A8F',
              500: '#4C6BA8', // Primary dark blue
              600: '#5B7CC1',
              700: '#6A8DDA',
              800: '#799EF3',
              900: '#88AFFF',
            },
            green: {
              50: '#0A2A1A',
              100: '#0F3A25',
              200: '#1A4A35',
              300: '#2D5A45',
              400: '#3D6A55',
              500: '#4C7A65', // Primary dark green
              600: '#5B8A75',
              700: '#6A9A85',
              800: '#79AA95',
              900: '#88BAA5',
            },
            neutral: {
              50: '#0A0A0A',
              100: '#1A1A1A',
              200: '#2A2A2A',
              300: '#3A3A3A',
              400: '#4A4A4A',
              500: '#5A5A5A',
              600: '#6A6A6A',
              700: '#7A7A7A',
              800: '#8A8A8A',
              900: '#9A9A9A',
            }
          }
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'lato': ['Lato', 'sans-serif'],
      },
      backgroundImage: {
        'kashmir-gradient': 'linear-gradient(135deg, #E6F3FF 0%, #F0FFF4 50%, #FAFAFA 100%)',
        'kashmir-dark': 'linear-gradient(135deg, #0A1A2F 0%, #0A2A1A 50%, #0A0A0A 100%)',
        'uv-protection': 'linear-gradient(135deg, #FFE5CC 0%, #FFF0E5 50%, #FFF5EB 100%)',
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
