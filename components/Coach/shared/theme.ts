/**
 * Design System - Mobile-First Theme
 *
 * Consistent colors, spacing, and design tokens across the app.
 * Based on fitness app best practices.
 */

export const theme = {
  // Colors - Vibrant but professional
  colors: {
    // Primary (Coach brand)
    primary: {
      50: '#EBF5FF',
      100: '#D6EBFF',
      500: '#3B82F6', // Main blue
      600: '#2563EB',
      700: '#1D4ED8',
    },

    // Success (positive feedback)
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
    },

    // Warning (caution)
    warning: {
      50: '#FFF7ED',
      500: '#F59E0B',
      600: '#D97706',
    },

    // Error (problems)
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
    },

    // Neutral (text, backgrounds)
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Semantic colors
    userMessage: '#3B82F6', // Blue
    coachMessage: '#FFFFFF', // White
    background: '#F9FAFB', // Light gray
    surface: '#FFFFFF', // White
  },

  // Spacing (mobile-optimized)
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    xxl: '3rem',   // 48px
  },

  // Typography (mobile-readable)
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'Monaco, Consolas, "Courier New", monospace',
    },

    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px (minimum for mobile - prevents auto-zoom)
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },

    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',  // Circle
  },

  // Shadows (subtle, mobile-friendly)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // Touch targets (mobile-optimized)
  touchTarget: {
    min: '44px', // iOS minimum
    comfortable: '48px', // Android minimum
    large: '56px', // Extra comfortable
  },

  // Transitions
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Helper functions
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = theme.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (size: keyof typeof theme.spacing) => theme.spacing[size];

export const getFontSize = (size: keyof typeof theme.typography.fontSize) =>
  theme.typography.fontSize[size];

export type Theme = typeof theme;
