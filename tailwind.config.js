/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'spring-red': '#FF6B35',
        'spring-gold': '#FFD700',
        'spring-dark': '#1a1a2e',
      },
      backgroundImage: {
        'spring-gradient': 'linear-gradient(135deg, #FF6B35 0%, #FFD700 100%)',
        'festival-bg': 'radial-gradient(ellipse at center, rgba(255,107,53,0.1) 0%, rgba(26,26,46,0.8) 70%)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #FF6B35, 0 0 10px #FF6B35, 0 0 15px #FF6B35' },
          '100%': { boxShadow: '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.2)' },
        },
      },
      fontFamily: {
        'chinese': ['PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'WenQuanYi Micro Hei', 'sans-serif'],
      },
    },
  },
  plugins: [],
}