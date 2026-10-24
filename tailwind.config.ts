import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0A0A0A",
        paper: "#FAFAF8",
        line: "#0A0A0A",
        muted: "#6B6B66",
        panel: "#F1F0EC",
        accent: {
          DEFAULT: "#FF7A00",
          dark: "#CC5F00",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      boxShadow: {
        hard: "6px 6px 0 0 #0A0A0A",
        "hard-sm": "4px 4px 0 0 #0A0A0A",
        "hard-lg": "10px 10px 0 0 #0A0A0A",
      },
      borderRadius: {
        none: "0px",
      },
      letterSpacing: {
        widest2: "0.2em",
      },
    },
  },
  plugins: [],
};
export default config;
