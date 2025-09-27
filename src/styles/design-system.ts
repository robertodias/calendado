/**
 * Calendado Design System
 * 
 * A sophisticated design system combining Google's Material Design principles
 * with Airbnb's refined aesthetics, featuring Calendado's signature purple.
 * 
 * Inspiration: Google Material Design 3 + Airbnb Design Language System
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Brand Colors (Purple Gradient)
  primary: {
    50: '#faf7ff',
    100: '#f3edff', 
    200: '#e9ddff',
    300: '#d6c4ff',
    400: '#bc9eff',
    500: '#9f75ff', // Main brand purple
    600: '#8b5cf6', // Primary purple (from landing)
    700: '#7c3aed',
    800: '#6d28d9',
    900: '#5b21b6',
    950: '#3b0764',
  },

  // Secondary Colors (Pink Accent)
  secondary: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777', // Secondary pink (from landing)
    700: '#be185d',
    800: '#9d174d',
    900: '#831843',
  },

  // Neutral Grays (Google-inspired)
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    950: '#0f0f0f',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
} as const;

// ============================================================================
// TYPOGRAPHY SYSTEM
// ============================================================================

export const typography = {
  // Font Families (Google-inspired)
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
    display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'], // For headlines
  },

  // Font Sizes (Material Design 3 Type Scale)
  fontSize: {
    'display-large': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.02em', fontWeight: '400' }],
    'display-medium': ['2.8125rem', { lineHeight: '3.25rem', letterSpacing: '-0.01em', fontWeight: '400' }],
    'display-small': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '0em', fontWeight: '400' }],
    
    'headline-large': ['2rem', { lineHeight: '2.5rem', letterSpacing: '0em', fontWeight: '600' }],
    'headline-medium': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0em', fontWeight: '600' }],
    'headline-small': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0em', fontWeight: '600' }],
    
    'title-large': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '0em', fontWeight: '500' }],
    'title-medium': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em', fontWeight: '500' }],
    'title-small': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '500' }],
    
    'label-large': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em', fontWeight: '500' }],
    'label-medium': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '500' }],
    'label-small': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.05em', fontWeight: '500' }],
    
    'body-large': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em', fontWeight: '400' }],
    'body-medium': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.02em', fontWeight: '400' }],
    'body-small': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.04em', fontWeight: '400' }],
  },
} as const;

// ============================================================================
// SPACING SYSTEM
// ============================================================================

export const spacing = {
  // 8px grid system (Material Design)
  0: '0px',
  1: '4px',   // 0.25rem
  2: '8px',   // 0.5rem  - Base unit
  3: '12px',  // 0.75rem
  4: '16px',  // 1rem    - Standard padding
  5: '20px',  // 1.25rem
  6: '24px',  // 1.5rem  - Card padding
  8: '32px',  // 2rem    - Section spacing
  10: '40px', // 2.5rem
  12: '48px', // 3rem    - Large spacing
  16: '64px', // 4rem    - Extra large
  20: '80px', // 5rem
  24: '96px', // 6rem    - Section margins
} as const;

// ============================================================================
// ELEVATION SYSTEM (Material Design 3)
// ============================================================================

export const elevation = {
  0: {
    boxShadow: 'none',
  },
  1: {
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
  },
  2: {
    boxShadow: '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
  },
  3: {
    boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  4: {
    boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  5: {
    boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  6: {
    boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
} as const;

// ============================================================================
// BORDER RADIUS SYSTEM
// ============================================================================

export const borderRadius = {
  none: '0px',
  sm: '4px',   // Small elements
  md: '8px',   // Default
  lg: '12px',  // Cards
  xl: '16px',  // Modals
  '2xl': '24px', // Hero elements
  '3xl': '32px', // Special cases
  full: '9999px', // Pills/badges
} as const;

// ============================================================================
// COMPONENT TOKENS
// ============================================================================

export const components = {
  // Button System
  button: {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
      hover: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.secondary[700]} 100%)`,
      text: colors.neutral[0],
      shadow: elevation[2].boxShadow,
      hoverShadow: elevation[3].boxShadow,
      radius: borderRadius.lg,
    },
    secondary: {
      background: colors.neutral[0],
      hover: colors.neutral[50],
      text: colors.neutral[900],
      border: colors.neutral[300],
      shadow: elevation[1].boxShadow,
      hoverShadow: elevation[2].boxShadow,
      radius: borderRadius.lg,
    },
    ghost: {
      background: 'transparent',
      hover: colors.neutral[100],
      text: colors.neutral[700],
      hoverText: colors.neutral[900],
      radius: borderRadius.lg,
    },
  },

  // Card System
  card: {
    background: colors.neutral[0],
    border: colors.neutral[200],
    shadow: elevation[1].boxShadow,
    hoverShadow: elevation[2].boxShadow,
    radius: borderRadius.xl,
    padding: spacing[6],
  },

  // Input System
  input: {
    background: colors.neutral[0],
    border: colors.neutral[300],
    focusBorder: colors.primary[600],
    text: colors.neutral[900],
    placeholder: colors.neutral[500],
    radius: borderRadius.lg,
    shadow: elevation[1].boxShadow,
    focusShadow: `0 0 0 3px ${colors.primary[600]}20`,
  },

  // Navigation System
  navigation: {
    background: colors.neutral[0],
    border: colors.neutral[200],
    shadow: elevation[2].boxShadow,
    activeBackground: colors.primary[50],
    activeText: colors.primary[700],
    inactiveText: colors.neutral[600],
    hoverBackground: colors.neutral[100],
  },
} as const;

// ============================================================================
// ANIMATION SYSTEM
// ============================================================================

export const animations = {
  // Duration (Material Design Motion)
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },

  // Easing Functions
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },

  // Common Transitions
  transition: {
    all: `all 250ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
    colors: `color 250ms cubic-bezier(0.4, 0.0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
    transform: `transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
    shadow: `box-shadow 250ms cubic-bezier(0.4, 0.0, 0.2, 1)`,
  },
} as const;

// ============================================================================
// BREAKPOINTS (Mobile-first)
// ============================================================================

export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
} as const;

// Export the complete design system
export const designSystem = {
  colors,
  typography,
  spacing,
  elevation,
  borderRadius,
  components,
  animations,
  breakpoints,
} as const;

export default designSystem;
