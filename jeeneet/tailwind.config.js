/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        nta: {
          blue: "#003580",
          darkblue: "#001f4d",
          orange: "#f7941d",
          lightblue: "#0066cc",
          bg: "#f4f6fb",
          border: "#d0d9e8",
        },
      },
      fontFamily: {
        sans: ["'Noto Sans'", "sans-serif"],
        heading: ["'Mukta'", "sans-serif"],
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(251, 146, 60, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(251, 146, 60, 0.8)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "premium-gradient": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "dark-gradient": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
