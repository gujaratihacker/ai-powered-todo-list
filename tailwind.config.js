/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#b8ccff',
          300: '#8dabff',
          400: '#6086ff',
          500: '#3b63f5',
          600: '#2a49d8',
          700: '#2239ac',
          800: '#1e3387',
          900: '#1c2d6b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgb(0 0 0 / 0.15)',
      },
    },
  },
  plugins: [],
}
