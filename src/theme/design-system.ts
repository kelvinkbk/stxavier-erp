// src/theme/design-system.ts
// Modern Design System for St. Xavier ERP

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    900: '#312e81',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },

  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
  },

  // Neutral Colors
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Background & Surface
  background: '#ffffff',
  surface: '#f8fafc',
  card: '#ffffff',

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
  },

  // Role-based Colors
  roles: {
    admin: '#dc2626',
    faculty: '#2563eb',
    student: '#059669',
  },
};

export const typography = {
  fonts: {
    primary: 'System',
    mono: 'SF Mono',
  },

  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Component Variants
export const componentVariants = {
  button: {
    primary: {
      backgroundColor: colors.primary[600],
      color: colors.text.inverse,
    },
    secondary: {
      backgroundColor: colors.gray[100],
      color: colors.text.primary,
    },
    success: {
      backgroundColor: colors.success[600],
      color: colors.text.inverse,
    },
    warning: {
      backgroundColor: colors.warning[600],
      color: colors.text.inverse,
    },
    error: {
      backgroundColor: colors.error[600],
      color: colors.text.inverse,
    },
  },

  card: {
    default: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      ...shadows.base,
    },
    elevated: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.lg,
      ...shadows.lg,
    },
  },
};

// Utility Functions
export const getColorByRole = (role: string) => {
  return colors.roles[role as keyof typeof colors.roles] || colors.primary[600];
};

export const getTextColorByBackground = (backgroundColor: string) => {
  // Simple contrast logic - in production, use a proper contrast calculation
  const darkColors = [
    colors.primary[600],
    colors.primary[700],
    colors.success[600],
    colors.error[600],
    colors.warning[600],
  ];

  return darkColors.includes(backgroundColor) ? colors.text.inverse : colors.text.primary;
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  componentVariants,
  getColorByRole,
  getTextColorByBackground,
};
