import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Hello World Mobile',
  slug: 'hello-world-mobile',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './src/assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#6750A4',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.helloworld.mobile',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './src/assets/android-icon-foreground.png',
      backgroundColor: '#6750A4',
    },
    package: 'com.helloworld.mobile',
  },
  scheme: 'helloworld',
  plugins: ['expo-asset', 'expo-font', 'expo-secure-store'],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com',
    appEnv: process.env.EXPO_PUBLIC_APP_ENV ?? 'development',
    enableMockAuth: process.env.EXPO_PUBLIC_ENABLE_MOCK_AUTH !== 'false',
  },
});
