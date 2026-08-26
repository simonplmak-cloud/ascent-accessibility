import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "rgb(var(--t-bg) / <alpha-value>)",
          surface: "rgb(var(--t-surface) / <alpha-value>)",
          border: "rgb(var(--t-border) / <alpha-value>)",
          fg: "rgb(var(--t-fg) / <alpha-value>)",
          muted: "rgb(var(--t-muted) / <alpha-value>)",
          critical: "rgb(var(--t-critical) / <alpha-value>)",
          serious: "rgb(var(--t-serious) / <alpha-value>)",
          moderate: "rgb(var(--t-moderate) / <alpha-value>)",
          minor: "rgb(var(--t-minor) / <alpha-value>)",
          pass: "rgb(var(--t-pass) / <alpha-value>)",
          partial: "rgb(var(--t-partial) / <alpha-value>)",
          fail: "rgb(var(--t-fail) / <alpha-value>)",
        },
        brand: "rgb(var(--brand) / <alpha-value>)",
        brandLink: "rgb(var(--brand-link) / <alpha-value>)",
        brandDeep: "rgb(var(--brand-deep) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "var(--elev)",
      },
    },
  },
  plugins: [],
};

export default config;
