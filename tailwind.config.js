/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Custom Color Palette
      colors: {
        // Primary Brand Colors (Purple)
        primary: {
          50: '#faf7ff',
          100: '#f3edff', 
          200: '#e9ddff',
          300: '#d6c4ff',
          400: '#bc9eff',
          500: '#9f75ff',
          600: '#8b5cf6', // Main brand purple
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
          950: '#3b0764',
        },
        // Secondary Colors (Pink)
        secondary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        // Enhanced Neutral Palette
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
      },
      
      // Typography System (Material Design 3)
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      
      fontSize: {
        'display-large': ['3.5rem', { lineHeight: '4rem', letterSpacing: '-0.02em' }],
        'display-medium': ['2.8125rem', { lineHeight: '3.25rem', letterSpacing: '-0.01em' }],
        'display-small': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '0em' }],
        'headline-large': ['2rem', { lineHeight: '2.5rem', letterSpacing: '0em' }],
        'headline-medium': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '0em' }],
        'headline-small': ['1.5rem', { lineHeight: '2rem', letterSpacing: '0em' }],
        'title-large': ['1.375rem', { lineHeight: '1.75rem', letterSpacing: '0em' }],
        'title-medium': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'title-small': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'body-large': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0.01em' }],
        'body-medium': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.02em' }],
        'body-small': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.04em' }],
        'label-large': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'label-medium': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
        'label-small': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.05em' }],
      },
      
      // Enhanced Border Radius
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
      },
      
      // Enhanced Shadows (Material Design 3)
      boxShadow: {
        'sm': '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
        'md': '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
        'lg': '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'xl': '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '2xl': '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '3xl': '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
        // Brand shadows
        'primary': '0px 4px 14px 0px rgba(139, 92, 246, 0.2)',
        'primary-lg': '0px 8px 25px 0px rgba(139, 92, 246, 0.3)',
      },
      
      // Animation System
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        'decelerate': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'accelerate': 'cubic-bezier(0.4, 0.0, 1, 1)',
        'sharp': 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      },
      
      // Spacing (8px grid system)
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
      },
    },
  },
  plugins: [],
}
