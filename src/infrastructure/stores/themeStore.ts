import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColorTheme, colorThemes, deepOceanTheme } from '../../presentation/theme/colorThemes';

interface ThemeState {
  currentTheme: ColorTheme;
  setTheme: (themeId: string) => void;
  availableThemes: ColorTheme[];
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: deepOceanTheme, // 기본 테마
      availableThemes: colorThemes,
      
      setTheme: (themeId: string) => {
        const theme = colorThemes.find(t => t.id === themeId);
        if (theme) {
          set({ currentTheme: theme });
        }
      },
    }),
    {
      name: 'theme-storage', // localStorage key
    }
  )
);