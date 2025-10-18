/**
 * Design System Tokens
 *
 * SINGLE SOURCE OF TRUTH for all design values.
 * Change these tokens to instantly update the entire app's look and feel.
 *
 * IMPORTANT: Never use hardcoded colors/sizes in components!
 * Always reference these tokens or the Tailwind classes generated from them.
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Brand Colors
  primary: {
    DEFAULT: '#FF6B35', // Iron Orange - main brand color
    light: '#FF8C5A',
    dark: '#E85A28',
    50: '#FFF5F2',
    100: '#FFE6DD',
    200: '#FFCDB8',
    300: '#FFB494',
    400: '#FF8C5A',
    500: '#FF6B35',
    600: '#E85A28',
    700: '#C74A1D',
    800: '#A63B15',
    900: '#7A2B0F',
  },

  // Neutrals
  neutral: {
    black: '#0A0A0A', // Iron Black - backgrounds
    gray: '#8E8E93', // Iron Gray - secondary text
    white: '#FFFFFF', // Iron White - primary text
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#8E8E93',
    600: '#737373',
    700: '#525252',
    800: '#262626',
    900: '#0A0A0A',
  },

  // Semantic Colors
  success: {
    DEFAULT: '#34C759',
    light: '#4ADA6E',
    dark: '#28A745',
  },
  error: {
    DEFAULT: '#FF3B30',
    light: '#FF5449',
    dark: '#E6251C',
  },
  warning: {
    DEFAULT: '#FF9500',
    light: '#FFAA33',
    dark: '#E68600',
  },
  info: {
    DEFAULT: '#007AFF',
    light: '#339FFF',
    dark: '#0062CC',
  },

  // Macro Colors (Nutrition tracking - industry standard colors)
  macro: {
    protein: '#10B981', // Green - standard for protein in fitness apps
    carbs: '#3B82F6',   // Blue - standard for carbohydrates
    fat: '#F97316',     // Orange - standard for fats
  },

  // Glass Effects
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.1)',
    dark: 'rgba(10, 10, 10, 0.8)',
  },
} as const

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
    display: ['Inter', 'sans-serif'], // Can be changed to custom display font
  },

  // Font Sizes (mobile-first, scales up on larger screens)
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  3.5: '0.875rem', // 14px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  7: '1.75rem', // 28px
  8: '2rem', // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  14: '3.5rem', // 56px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.25rem', // 4px
  DEFAULT: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  '3xl': '3rem', // 48px
  full: '9999px',
} as const

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  none: 'none',

  // Glass effect shadow
  glass: '0 8px 32px 0 rgba(255, 107, 53, 0.1)',
} as const

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    DEFAULT: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  timing: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const

// ============================================================================
// BREAKPOINTS (Mobile-first)
// ============================================================================

export const breakpoints = {
  sm: '640px', // Small tablets
  md: '768px', // Tablets
  lg: '1024px', // Laptops
  xl: '1280px', // Desktops
  '2xl': '1536px', // Large desktops
} as const

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const

// ============================================================================
// COMPONENT-SPECIFIC TOKENS
// ============================================================================

export const components = {
  // Buttons
  button: {
    height: {
      sm: spacing[8], // 32px
      md: spacing[10], // 40px
      lg: spacing[12], // 48px
    },
    padding: {
      sm: `${spacing[2]} ${spacing[4]}`,
      md: `${spacing[3]} ${spacing[6]}`,
      lg: `${spacing[4]} ${spacing[8]}`,
    },
    borderRadius: borderRadius.md,
  },

  // Cards
  card: {
    padding: spacing[6], // 24px
    borderRadius: borderRadius.xl,
    shadow: shadows.glass,
  },

  // Inputs
  input: {
    height: spacing[12], // 48px
    padding: spacing[4], // 16px
    borderRadius: borderRadius.md,
    borderWidth: '2px',
  },

  // Navigation
  nav: {
    height: spacing[16], // 64px
    padding: spacing[4],
  },
} as const

// ============================================================================
// LOGO & BRANDING
// ============================================================================

export const branding = {
  logo: {
    // Logo can be text, SVG, or image path
    type: 'text' as 'text' | 'svg' | 'image',
    text: 'SHARPENED',
    // For SVG/image logos, set path here:
    // path: '/logo.svg',
    height: '2rem', // 32px
  },

  // Emoji style (for React Native compatibility)
  emoji: {
    style: 'native' as 'native' | 'apple' | 'google' | 'twitter',
  },
} as const

// ============================================================================
// TYPE EXPORTS (for TypeScript autocomplete)
// ============================================================================

export type ColorToken = typeof colors
export type TypographyToken = typeof typography
export type SpacingToken = typeof spacing
export type BorderRadiusToken = typeof borderRadius
export type ShadowToken = typeof shadows
export type TransitionToken = typeof transitions
export type BreakpointToken = typeof breakpoints
export type ZIndexToken = typeof zIndex
export type ComponentToken = typeof components
export type BrandingToken = typeof branding

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  components,
  branding,
} as const

export default theme
