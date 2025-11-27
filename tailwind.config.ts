import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'graky-dark': '#1a1a1a',
        'graky-charcoal': '#2d2d2d',
        'graky-brown': '#8B7355',
        'graky-tan': '#D4A574',
        'graky-cream': '#F5EFE7',
        'graky-olive': '#6B8E23',
        'graky-rust': '#A0522D',
        // Dark mode colors - warm and comfortable
        'dark-bg': '#1F1B16', // Warm dark background (not too dark)
        'dark-surface': '#2A2520', // Slightly lighter for cards/surfaces
        'dark-border': '#3A3530', // Subtle borders
        'dark-text': '#E8E3DC', // Soft warm text
        'dark-text-muted': '#B8B3AC', // Muted text for secondary content
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
export default config
