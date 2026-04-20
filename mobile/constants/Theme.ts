/**
 * Velocity Slate Design System Tokens
 * Derived from Stitch Kinetic Oasis Specification
 */

export const Theme = {
  colors: {
    background: '#10141a',
    surface: '#10141a',
    surfaceLow: '#181c22',
    surfaceHigh: '#262a31',
    surfaceHighest: '#31353c',
    surfaceVariant: '#31353c',
    
    primary: '#adc6ff',
    primaryContainer: '#4b8eff',
    onPrimary: '#002e69',
    
    secondary: '#ffb59f',
    secondaryContainer: '#9e2b00',
    onSecondary: '#5e1600',
    
    tertiary: '#4ae183',
    tertiaryContainer: '#00a657',
    
    text: '#dfe2eb',
    textVariant: '#c1c6d7',
    outline: '#414755',
    
    error: '#ffb4ab',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },
  roundness: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  typography: {
    display: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 40,
      letterSpacing: -0.64,
    },
    headline: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    title: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    label: {
      fontSize: 11,
      fontWeight: '700' as const,
      lineHeight: 16,
      letterSpacing: 1.1, // +10%
      textTransform: 'uppercase' as const,
    },
  },
};
