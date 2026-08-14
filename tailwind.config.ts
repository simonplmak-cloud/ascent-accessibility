import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        terminal: {
          bg: "#0b0f14",
          surface: "#111820",
          border: "#2a3542",
          fg: "#e6edf3",
          muted: "#9da7b0",
          critical: "#ff7b72",
          serious: "#ffa657",
          moderate: "#e3b341",
          minor: "#9da7b0",
          pass: "#3fb950",
          partial: "#e3b341",
          fail: "#ff7b72",
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
