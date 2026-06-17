export const lightColors = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  background: '#FFFBFE',
  surface: '#FFFBFE',
  onBackground: '#1C1B1F',
  onSurface: '#1C1B1F',
  outline: '#79747E',
  error: '#B3261E',
} as const;

export const darkColors = {
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  background: '#1C1B1F',
  surface: '#1C1B1F',
  onBackground: '#E6E1E5',
  onSurface: '#E6E1E5',
  outline: '#938F99',
  error: '#F2B8B5',
} as const;

export type AppColors = typeof lightColors | typeof darkColors;
