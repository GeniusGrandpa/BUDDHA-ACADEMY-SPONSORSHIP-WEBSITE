/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff5ed',
          100: '#ffead5',
          200: '#fdd1a8',
          300: '#fcb375',
          400: '#fa8c3e',
          500: '#f26b1d',
          600: '#d95317',
          700: '#b53f14',
          800: '#8f3314',
          900: '#742c14',
          950: '#3e1308',
        },
        warm: {
          50: '#fffaf5',
          100: '#faf6ee',
          200: '#f5edd9',
          300: '#eddfb8',
          400: '#e3cc8e',
          500: '#d4b26a',
          600: '#c49a4e',
          700: '#a37d3f',
          800: '#856637',
          900: '#6d5431',
          950: '#3a2c19',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 8s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-16px)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(10px, -10px)' },
          '66%': { transform: 'translate(-5px, 5px)' },
        },
      },
    },
  },
  plugins: [],
}
