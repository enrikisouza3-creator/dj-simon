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
        cyan: {
          400: "#00f5ff",
          500: "#00e5f5",
          600: "#00c4d4",
        },
        dark: {
          900: "#020408",
          800: "#060d14",
          700: "#0a1628",
          600: "#0d1f3c",
        },
      },
      fontFamily: {
        display: ["'Bebas Neue'", "cursive"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'Space Mono'", "monospace"],
      },
      animation: {
        "pulse-cyan": "pulse-cyan 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "glow": "glow 3s ease-in-out infinite alternate",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 3s linear infinite",
      },
      keyframes: {
        "pulse-cyan": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: ".5" },
        },
        "glow": {
          "from": { textShadow: "0 0 20px #00f5ff, 0 0 40px #00f5ff" },
          "to": { textShadow: "0 0 40px #00f5ff, 0 0 80px #00f5ff, 0 0 120px #00f5ff" },
        },
        "float": {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "scan": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
