const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    path.resolve(__dirname, './app/**/*.{js,jsx,ts,tsx}'),
    path.resolve(__dirname, './components/**/*.{js,jsx,ts,tsx}'),
    path.resolve(__dirname, './lib/**/*.{js,jsx,ts,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0e0e16',
          card: '#13131f',
          hover: '#1a1a28',
          border: '#1e1e30',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};
