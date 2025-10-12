import type { Config } from 'tailwindcss'
import { theme } from './lib/design-system/tokens'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    // Import design system tokens
    colors: theme.colors,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize,
    fontWeight: theme.typography.fontWeight,
    lineHeight: theme.typography.lineHeight,
    letterSpacing: theme.typography.letterSpacing,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    boxShadow: theme.shadows,
    transitionDuration: theme.transitions.duration,
    transitionTimingFunction: theme.transitions.timing,
    screens: theme.breakpoints,
    zIndex: theme.zIndex,

    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },

    extend: {
      // Additional Tailwind utilities
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

export default config
