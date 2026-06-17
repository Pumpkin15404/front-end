import Constants from 'expo-constants';

type AppExtra = {
  apiBaseUrl?: string;
  appEnv?: string;
  enableMockAuth?: boolean;
};

const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra;

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? 'https://api.example.com',
  appEnv: extra.appEnv ?? 'development',
  isDev: (extra.appEnv ?? 'development') === 'development',
  enableMockAuth: extra.enableMockAuth ?? true,
} as const;
