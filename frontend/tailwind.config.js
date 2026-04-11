/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(100%) scale(0.8) rotate(-10deg)', opacity: '0' },
          '10%': { opacity: '0.5' },
          '90%': { opacity: '0.5' },
          '100%': { transform: 'translateY(-1000%) scale(1.2) rotate(10deg)', opacity: '0' },
        }
      },
      animation: {
        'float-up': 'floatUp 15s linear infinite',
      }
    },
  },
  plugins: [],
};
