import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#f5f6f8",
        header: "var(--header-bg)", // #0f766e
        card: "var(--card-bg)", // #ffffff
        primary: "var(--text-primary)", // #1a202c
        secondary: "var(--text-secondary)", // #4a5568
        accent: "var(--accent)", // #0d9488
        divider: "var(--card-border)", // #e2e8f0
        teal: {
          primary: "var(--teal-primary)", // #0d9488
          dark: "var(--teal-dark)", // #0f766e
          light: "var(--teal-light)", // #ccfbf1
          50: "var(--teal-50)", // #f0fdfa
          500: "#0d9488", // Fallback/Utility
          600: "#0f766e", // Fallback/Utility
          700: "#0e645d", // Darker
        },
        status: {
          critical: "var(--status-exceeds)", // #dc2626
          warning: "var(--status-caution)", // #d97706
          safe: "var(--status-safe)", // #059669
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
