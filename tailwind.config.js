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
        // EDITORIAL DAYLIGHT WHITE PALETTE
        // Background tokens — pure paper, layered surfaces
        paper:        '#FFFFFF', // pure daylight white — body bg
        'paper-2':    '#FAFAF9', // hairline alt for striping
        card:         '#FFFFFF', // card bg same as paper for clean borders
        rule:         '#E5E2DB', // newspaper rule lines + card borders
        'rule-strong':'#0A0A0A', // section dividers

        // Ink (text) tokens
        ink:           '#0A0A0A', // primary ink — headlines, copy
        'ink-2':       '#4A4A4A', // body, secondary
        'ink-muted':   '#8A8682', // metadata, timestamps, eyebrows
        'ink-faint':   '#B8B5B0', // disabled, placeholder

        // Accent — same red, repurposed for daylight context
        accent:        '#DC2626', // editorial red — prices, CTAs, dot in wordmark
        'accent-dark': '#991B1B',
        'accent-soft': '#FEE2E2', // 50-stop wash for badges

        // Semantic
        good:    '#15803D', // 'Lowest in 90 days', verified badges
        warn:    '#A16207',

        // BACKWARD COMPAT — keep brand-* tokens as aliases pointing at new ink/paper
        // so any component we haven't touched still renders sensibly during the pivot.
        brand: {
          red:        '#DC2626',
          'red-dark': '#991B1B',
          'red-light':'#EF4444',
          dark:       '#0A0A0A', // was bg, now treated as ink
          'dark-2':   '#1A1A1A',
          'dark-3':   '#FFFFFF', // was card bg — now mapped to paper-card so legacy components turn light
          'dark-4':   '#F5F2EC', // was hover bg — now mapped to soft paper
          'dark-5':   '#E5E2DB',
          gray:       '#8A8682',
          'gray-2':   '#4A4A4A',
          'gray-3':   '#0A0A0A',
          gold:       '#A16207',
          green:      '#15803D',
          blue:       '#1E40AF',
        }
      },
      fontFamily: {
        // Editorial serif for display + section headlines
        serif:   ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        // Sans for nav, body, UI
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
        // Heading slot now points at serif for editorial sections; legacy uses still get a serif
        heading: ['Newsreader', 'Playfair Display', 'Georgia', 'serif'],
        // Keep Barlow available as 'condensed' for the wordmark and ALL CAPS nav
        condensed: ['Barlow Condensed', 'sans-serif'],
        // Mono for prices, ZIP counts, hotness scores — feels like financial data
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':    'fadeIn 0.3s ease-out',
        'ticker':     'ticker 40s linear infinite',
      },
      keyframes: {
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
        // No glows. Just subtle editorial card lifts when needed.
        'card-hover':  '0 1px 0 rgba(10,10,10,0.04), 0 8px 16px -4px rgba(10,10,10,0.06)',
      },
    },
  },
  plugins: [],
}
