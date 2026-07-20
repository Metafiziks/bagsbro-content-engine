/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF3366',
        secondary: '#00F5FF',
        'dark-bg': '#0A0A0F',
        'light-text': '#FFFFFF',
        'accent-yellow': '#FFD700',
        'purple-dark': '#1A1A2E',
        'blue-dark': '#16213E',
      },
      fontFamily: {
        pixel: ['Silkscreen', 'cursive'],
        fredoka: ['Fredoka', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      animation: {
        'glitch': 'glitch 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'fadeIn': 'fadeIn 1s ease-out forwards',
        'fadeInUp': 'fadeInUp 0.8s ease-out forwards',
        'pulse-custom': 'pulse-custom 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        glitch: {
          '0%, 90%, 100%': { transform: 'translate(0)' },
          '92%': { transform: 'translate(-2px, 2px)' },
          '94%': { transform: 'translate(2px, -2px)' },
          '96%': { transform: 'translate(-2px, -2px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-custom': {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 40px rgba(0, 245, 255, 0.4), inset 0 0 40px rgba(0, 245, 255, 0.2)',
          },
          '50%': {
            transform: 'scale(1.02)',
            boxShadow: '0 0 60px rgba(0, 245, 255, 0.6), inset 0 0 60px rgba(0, 245, 255, 0.3)',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            textShadow: '0 0 30px rgba(132, 204, 22, 0.8), 0 0 60px rgba(132, 204, 22, 0.4)',
          },
          '50%': {
            textShadow: '0 0 40px rgba(132, 204, 22, 1), 0 0 80px rgba(132, 204, 22, 0.6), 0 0 120px rgba(132, 204, 22, 0.3)',
          },
        },
        'pulse-gold': {
          '0%, 100%': {
            textShadow: '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)',
          },
          '50%': {
            textShadow: '0 0 40px rgba(255, 215, 0, 1), 0 0 80px rgba(255, 215, 0, 0.6), 0 0 120px rgba(255, 215, 0, 0.3)',
          },
        },
      },
    },
  },
  plugins: [],
}