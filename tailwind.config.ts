import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "tuscan-brown": "#5D4037",
        "terracotta": "#C75B39",
        "olive-green": "#6B8E23",
        "warm-cream": "#FFF8E7",
        "light-stone": "#F5F0E8",
        "dark-text": "#2C2C2C",
      },
      fontFamily: {
        heading: ['"Playfair Display"', "Georgia", "serif"],
        body: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      keyframes: {
        "cta-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(107, 142, 35, 0.3)" },
          "50%": { boxShadow: "0 0 18px rgba(107, 142, 35, 0.5)" },
        },
      },
      animation: {
        "cta-glow": "cta-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
