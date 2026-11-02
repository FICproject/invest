/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFFDF7',
          100: '#FFF9ED',
          200: '#FDF0D0',
          300: '#F9DC8A',
          400: '#F4B41A',
          500: '#E8A51D',
          600: '#DE8E0A',
          700: '#B37400',
          800: '#8A5800',
          900: '#5C3A00',
          950: '#3D2600',
          dark: '#1F2421',
          gold: '#F4B41A',
          amber: '#DE8E0A',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

