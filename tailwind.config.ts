import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
        navy: {
          900: "#064e3b", // mapped to deep forest emerald
          950: "#022c22", // deep emerald midnight
        },
        brand: {
          primary: "#064E3B",
          secondary: "#059669",
          accent: "#10B981",
          light: "#ECFDF5",
          bg: "#F8FAFC",
          surface: "#FFFFFF",
          text: "#0F172A",
          muted: "#64748B",
          success: "#10B981",
          warning: "#F59E0B",
          danger: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};
export default config;
