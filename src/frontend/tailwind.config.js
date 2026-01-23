/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        german: {
          black: '#000000',
          red: '#DD0000',
          gold: '#FFCC00',
        },
        primary: {
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fcd38c',
          300: '#fbc25e',
          400: '#fab53c',
          500: '#f9a825',
          600: '#f59621',
          700: '#ef821c',
          800: '#e96f18',
          900: '#df4f11',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
