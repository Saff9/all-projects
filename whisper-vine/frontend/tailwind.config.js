/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                display: ["Anton", "Impact", "sans-serif"],
                body: ['"Space Mono"', "ui-monospace", "monospace"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                neon: "#39FF14",
                magenta: "#FF0055",
                void: "#09030E",
                surface: "#160822",
                surface2: "#26103A",
                vinepurple: "#8A2BE2",
            },
            boxShadow: {
                noir: "4px 4px 0 0 #2E1645",
                "noir-hover": "6px 6px 0 0 #39FF14",
                "noir-magenta": "4px 4px 0 0 #FF0055",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                glitch: {
                    "0%,100%": { transform: "translate(0,0)" },
                    "20%": { transform: "translate(-1px, 1px)" },
                    "40%": { transform: "translate(1px, -1px)" },
                    "60%": { transform: "translate(-1px, -1px)" },
                    "80%": { transform: "translate(1px, 1px)" },
                },
                fadein: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                bargrow: { from: { width: "0%" }, to: { width: "var(--target-width)" } },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                glitch: "glitch 0.4s ease-in-out",
                fadein: "fadein 0.5s ease-out forwards",
                bargrow: "bargrow 0.8s cubic-bezier(.2,.7,.3,1) forwards",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
