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
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
