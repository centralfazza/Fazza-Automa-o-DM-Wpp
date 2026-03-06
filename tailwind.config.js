/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Mapping slate to zinc for a neutral dark theme (removing blue tint)
        slate: colors.zinc,
        primary: '#00DC82', // Neon Mint Green from the image
        dark: '#09090b',    // Very dark background
        surface: '#18181b', // Card background
      }
    },
  },
  plugins: [],
}