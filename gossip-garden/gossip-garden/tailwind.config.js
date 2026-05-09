/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soft-green': '#E0F2F1',
        'earthy-brown': '#795548',
        'cream': '#FFF9C4',
        'plant-green': '#4CAF50',
        'plant-brown': '#8D6E63'
      },
      fontFamily: {
        'quicksand': ['Quicksand', 'sans-serif'],
        'nunito': ['Nunito', 'sans-serif']
      }
    },
  },
  plugins: [],
}