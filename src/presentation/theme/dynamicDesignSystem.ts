// 동적 디자인 시스템 - 테마에 따라 색상이 변경됨
import { ColorTheme } from './colorThemes';

export const createDynamicDesignSystem = (theme: ColorTheme) => {
  const { colors } = theme;

  // 8px 기준 간격 시스템
  const spacing = {
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

  // Border Radius 시스템
  const borderRadius = {
    none: 0,
    sm: 4,
    base: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  };

  // 그림자 시스템
  const shadows = {
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

  // 의미별 컬러 매핑
  const semanticColors = {
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

  // 타이포그래피 시스템
  const typography = {
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

  // 컴포넌트 토큰
  const components = {
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

  return {
    colors,
    semanticColors,
    typography,
    spacing,
    shadows,
    borderRadius,
    components,
  };
};