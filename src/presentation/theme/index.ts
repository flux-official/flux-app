import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export const lightTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6200EE',
    secondary: '#03DAC6',
    tertiary: '#FF5722',
    error: '#B00020',
    background: '#F6F6F6',
    surface: '#FFFFFF',
    onSurface: '#000000',
    surfaceVariant: '#E7E0EC',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BB86FC',
    secondary: '#03DAC6',
    tertiary: '#CF6679',
    error: '#CF6679',
    background: '#121212',
    surface: '#1E1E1E',
    onSurface: '#FFFFFF',
    surfaceVariant: '#49454F',
  },
};

export const theme = lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
};