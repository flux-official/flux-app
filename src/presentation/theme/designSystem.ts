// 기본 FLUX 브랜드 디자인 시스템 (기본값용)

export const colors = {
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#FF6B35',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  secondary: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  success: {
    50: '#F0FDF4',
    500: '#22C55E',
    600: '#16A34A',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  error: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const semanticColors = {
  background: {
    primary: colors.white,
    secondary: colors.neutral[50],
    tertiary: colors.neutral[100],
  },
  text: {
    primary: colors.neutral[900],
    secondary: colors.neutral[600], 
    tertiary: colors.neutral[500],
    inverse: colors.white,
    accent: colors.primary[500],
  },
  border: {
    light: colors.neutral[200],
    default: colors.neutral[300],
    strong: colors.neutral[400],
  },
  interactive: {
    primary: colors.primary[500],
    primaryHover: colors.primary[600],
    primaryPressed: colors.primary[700],
    secondary: colors.secondary[500],
    secondaryHover: colors.secondary[600],
  },
  status: {
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
  },
};

export const typography = {
  fontFamily: {
    primary: 'System',
    mono: 'monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
  styles: {
    h1: {
      fontSize: 30,
      fontWeight: '800',
      lineHeight: 36,
      color: colors.neutral[900],
    },
    h2: {
      fontSize: 24,
      fontWeight: '700',
      lineHeight: 32,
      color: colors.neutral[900],
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
      color: colors.neutral[900],
    },
    body1: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
      color: colors.neutral[900],
    },
    body2: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: colors.neutral[600],
    },
    caption: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      color: colors.neutral[500],
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 24,
      color: colors.white,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      lineHeight: 20,
      color: colors.neutral[900],
    },
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
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 6,
  },
  brand: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const components = {
  button: {
    primary: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
      color: colors.white,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.md,
      ...shadows.base,
    },
    secondary: {
      backgroundColor: colors.white,
      borderColor: colors.neutral[300],
      color: colors.neutral[700],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.md,
      borderWidth: 1,
    },
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    ...shadows.base,
  },
  input: {
    backgroundColor: colors.neutral[50],
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderWidth: 1,
  },
};