/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        floatUp: {
          '0%': { transform: 'translateY(100px) translateX(0) scale(0.8) rotate(-5deg)', opacity: '0' },
          '20%': { transform: 'translateY(-100px) translateX(-20px) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-400px) translateX(15px) scale(1.05) rotate(5deg)', opacity: '0.6' },
          '80%': { transform: 'translateY(-700px) translateX(-10px) scale(1) rotate(-2deg)', opacity: '0.4' },
          '100%': { transform: 'translateY(-1000px) translateX(20px) scale(0.9) rotate(5deg)', opacity: '0' },
        }
      },
      animation: {
        'float-up': 'floatUp 15s cubic-bezier(0.4, 0, 0.2, 1) infinite both',
      }
    },
  },
  plugins: [],
};
