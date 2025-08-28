/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0088cc',
        whatsapp: '#25d366',
        accent: '#8e44ad',
      },
    },
  },
  plugins: [],
}
