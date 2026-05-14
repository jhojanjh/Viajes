/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: { DEFAULT: '#FBF7F0', alt: '#F4EDE0', dark: '#13110D', 'dark-alt': '#1C1914' },
        surface: { DEFAULT: '#FFFFFF', soft: '#FDFAF4', dark: '#221E18', 'dark-soft': '#2A251E' },
        ink: { DEFAULT: '#1A1814', soft: '#5C564C', muted: '#8A8479', 'dark': '#FAF6EE', 'dark-soft': '#B8B0A0' },
        coral: { DEFAULT: '#FF6B47', soft: '#FFE4D9' },
        mint:  { DEFAULT: '#2BB089', soft: '#D4F0E5' },
        sky:   { DEFAULT: '#4A8FE7', soft: '#DBE8FA' },
        sun:   { DEFAULT: '#F5B82E', soft: '#FCEDC4' },
        plum:  { DEFAULT: '#7B4B94', soft: '#EADBF1' },
      },
    },
  },
};
