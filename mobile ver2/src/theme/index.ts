import { StyleSheet } from 'react-native';

import { AppColors, darkColors, lightColors } from './colors';

export function createTheme(colors: AppColors) {
  return {
    colors,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    typography: StyleSheet.create({
      headline: {
        fontSize: 28,
        fontWeight: '600',
        color: colors.onBackground,
      },
      body: {
        fontSize: 16,
        color: colors.onSurface,
      },
      caption: {
        fontSize: 12,
        color: colors.outline,
      },
    }),
  };
}

export const lightTheme = createTheme(lightColors);
export const darkTheme = createTheme(darkColors);

export type AppTheme = ReturnType<typeof createTheme>;
