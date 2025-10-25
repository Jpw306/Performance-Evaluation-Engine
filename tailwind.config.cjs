// tailwind.config.js
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        clash: {
          black: '#181818',
          white: '#FFFFFF',
          dark: '#23272A',
          blue: '#1A8FE3',
          gold: '#FFD700',
          goldShadow: '#945021',
          goldBorder: '#FCDB21',
          gray: '#A2A2A2',
          light: '#F5F6FA',
        },
      },
      fontFamily: {
        // Use the CSS variable from next/font/local for your custom Clash Royale fonts
        clash: ['var(--font-clash)', 'Impact', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.015em', // roughly -15 tracking
      },
      lineHeight: {
        tightHeadline: '1.1', // ~10% leading
        text: '1.45', // ~45% leading
      },
    },
  },
  plugins: [typography],
};
