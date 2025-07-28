/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9e8',
          100: '#ddf2c6',
          200: '#c2e891',
          300: '#9fd952',
          400: '#82c91e',
          500: '#7CB342',
          600: '#2D5016',
          700: '#245410',
          800: '#1e470d',
          900: '#1a3f0c',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#FF6F00',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        surface: {
          50: '#fefefe',
          100: '#fdfdfd',
          200: '#f9f9f9',
          300: '#f5f5f5',
          400: '#f0f0f0',
          500: '#e5e5e5',
          600: '#d1d5db',
          700: '#9ca3af',
          800: '#6b7280',
          900: '#374151',
        },
        background: '#f5f5f0',
      },
      fontFamily: {
        display: ['DM Sans', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'progress': 'progress 2s ease-in-out',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        progress: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width)' },
        }
      }
    },
  },
  plugins: [],
};