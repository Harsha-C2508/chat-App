/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#111118',
          800: '#1a1a28',
          700: '#22223a',
          600: '#2d2d45',
          500: '#3a3a55',
        },
        accent: '#3b82f6',
        surface: '#252538',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
