// tailwind.config.js
import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clash: {
          black: "#181818",
          white: "#FFFFFF",
          dark: "#23272A",
          blue: "#1A8FE3",
          gold: "#FFD700",
          goldDark: "#945021",
          goldBorder: "#FCDB21",
          goldBackground: "#F2B73F",
          gray: "#A2A2A2",
          light: "#F5F6FA",
        },
      },
      fontFamily: {
        clash: ["var(--font-clash)", "Impact", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.015em",
      },
      lineHeight: {
        tightHeadline: "1.1",
        text: "1.45",
      },
    },
  },
  plugins: [typography],
};