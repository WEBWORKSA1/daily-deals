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
        brand: {
          red:       '#E8222A',
          'red-dark':'#C41920',
          'red-light':'#FF3A43',
          dark:      '#0D0D0D',
          'dark-2':  '#141414',
          'dark-3':  '#1A1A1A',
          'dark-4':  '#222222',
          'dark-5':  '#2A2A2A',
          gray:      '#888888',
          'gray-2':  '#AAAAAA',
          'gray-3':  '#CCCCCC',
          gold:      '#F5A623',
          green:     '#22C55E',
          blue:      '#3B82F6',
        }
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.3s ease-out',
        'ticker':     'ticker 20s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'deal':  '0 2px 20px rgba(232, 34, 42, 0.15)',
        'card':  '0 4px 24px rgba(0,0,0,0.4)',
        'glow':  '0 0 30px rgba(232, 34, 42, 0.3)',
      },
    },
  },
  plugins: [],
}
