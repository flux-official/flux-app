// 4가지 블록체인/스테이블코인 테마 색상 팔레트

export interface ColorTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    accent: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    neutral: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    success: {
      50: string;
      500: string;
      600: string;
    };
    warning: {
      50: string;
      500: string;
      600: string;
    };
    error: {
      50: string;
      500: string;
      600: string;
    };
    white: string;
    black: string;
    transparent: string;
  };
}

// 1. Deep Ocean Theme - 안정성 + 신뢰감
export const deepOceanTheme: ColorTheme = {
  id: 'deepOcean',
  name: 'Deep Ocean',
  description: '깊은 바다처럼 안정적이고 신뢰감 있는 테마',
  colors: {
    primary: {
      50: '#EFF6FF',    // Very light blue
      100: '#DBEAFE',   
      200: '#BFDBFE',   
      300: '#93C5FD',   
      400: '#60A5FA',   
      500: '#3B82F6',   // Main blue
      600: '#1E3A8A',   // Deep navy
      700: '#1E40AF',   
      800: '#1E3A8A',   
      900: '#1E293B',   
    },
    secondary: {
      50: '#F0FDFA',    // Very light teal
      100: '#CCFBF1',   
      200: '#99F6E4',   
      300: '#5EEAD4',   
      400: '#2DD4BF',   
      500: '#14B8A6',   // Main teal
      600: '#0F766E',   // Dark teal
      700: '#0F766E',   
      800: '#115E59',   
      900: '#134E4A',   
    },
    accent: {
      50: '#ECFDF5',    // Very light green
      100: '#D1FAE5',   
      200: '#A7F3D0',   
      300: '#6EE7B7',   
      400: '#34D399',   
      500: '#10B981',   // Success green
      600: '#059669',   // Forest green
      700: '#047857',   
      800: '#065F46',   
      900: '#064E3B',   
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
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
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
  },
};

// 2. Crypto Purple Theme - 혁신 + 미래감
export const cryptoPurpleTheme: ColorTheme = {
  id: 'cryptoPurple',
  name: 'Crypto Purple',
  description: '혁신적이고 미래적인 암호화폐 테마',
  colors: {
    primary: {
      50: '#FAF5FF',    // Very light purple
      100: '#F3E8FF',   
      200: '#E9D5FF',   
      300: '#D8B4FE',   
      400: '#C084FC',   
      500: '#8B5CF6',   // Vibrant purple
      600: '#6B21A8',   // Deep purple
      700: '#7C3AED',   
      800: '#6B21A8',   
      900: '#581C87',   
    },
    secondary: {
      50: '#EEF2FF',    // Very light indigo
      100: '#E0E7FF',   
      200: '#C7D2FE',   
      300: '#A5B4FC',   
      400: '#818CF8',   
      500: '#6366F1',   // Bright indigo
      600: '#4338CA',   // Rich indigo
      700: '#4338CA',   
      800: '#3730A3',   
      900: '#312E81',   
    },
    accent: {
      50: '#ECFEFF',    // Very light cyan
      100: '#CFFAFE',   
      200: '#A5F3FC',   
      300: '#67E8F9',   
      400: '#22D3EE',   
      500: '#06B6D4',   // Electric cyan
      600: '#0891B2',   // Cyber cyan
      700: '#0E7490',   
      800: '#155E75',   
      900: '#164E63',   
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
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
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
  },
};

// 3. Neo Finance Theme - 모던 금융 + 역동성
export const neoFinanceTheme: ColorTheme = {
  id: 'neoFinance',
  name: 'Neo Finance',
  description: '모던하고 역동적인 차세대 금융 테마',
  colors: {
    primary: {
      50: '#EFF6FF',    // Very light blue
      100: '#DBEAFE',   
      200: '#BFDBFE',   
      300: '#93C5FD',   
      400: '#60A5FA',   
      500: '#2563EB',   // Sky blue
      600: '#1D4ED8',   // Electric blue
      700: '#1D4ED8',   
      800: '#1E40AF',   
      900: '#1E3A8A',   
    },
    secondary: {
      50: '#FAF5FF',    // Very light violet
      100: '#F3E8FF',   
      200: '#E9D5FF',   
      300: '#D8B4FE',   
      400: '#C084FC',   
      500: '#8B5CF6',   // Bright violet
      600: '#7C3AED',   // Royal violet
      700: '#7C3AED',   
      800: '#6B21A8',   
      900: '#581C87',   
    },
    accent: {
      50: '#FFF1F2',    // Very light rose
      100: '#FFE4E6',   
      200: '#FECDD3',   
      300: '#FDA4AF',   
      400: '#FB7185',   
      500: '#F43F5E',   // Coral rose
      600: '#E11D48',   // Premium rose
      700: '#BE123C',   
      800: '#9F1239',   
      900: '#881337',   
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
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
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
  },
};

// 4. Sophisticated Dark Theme - 고급감 + 차분함
export const sophisticatedDarkTheme: ColorTheme = {
  id: 'sophisticatedDark',
  name: 'Sophisticated Dark',
  description: '고급스럽고 차분한 프리미엄 테마',
  colors: {
    primary: {
      50: '#F8FAFC',    // Very light slate
      100: '#F1F5F9',   
      200: '#E2E8F0',   
      300: '#CBD5E1',   
      400: '#94A3B8',   
      500: '#64748B',   // Steel blue
      600: '#475569',   // Slate blue
      700: '#475569',   
      800: '#334155',   
      900: '#1E293B',   
    },
    secondary: {
      50: '#ECFDF5',    // Very light emerald
      100: '#D1FAE5',   
      200: '#A7F3D0',   
      300: '#6EE7B7',   
      400: '#34D399',   
      500: '#059669',   // Fresh emerald
      600: '#047857',   // Deep emerald
      700: '#047857',   
      800: '#065F46',   
      900: '#064E3B',   
    },
    accent: {
      50: '#FFFBEB',    // Very light amber
      100: '#FEF3C7',   
      200: '#FDE68A',   
      300: '#FCD34D',   
      400: '#FBBF24',   
      500: '#F59E0B',   // Golden amber
      600: '#D97706',   // Warm amber
      700: '#B45309',   
      800: '#92400E',   
      900: '#78350F',   
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
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
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
  },
};

export const colorThemes = [
  deepOceanTheme,
  cryptoPurpleTheme, 
  neoFinanceTheme,
  sophisticatedDarkTheme,
];