import { StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '@/state_management/themeStore';
import { createTheme, darkTheme, lightTheme } from '@/theme';
import { wp } from '@/utils/responsive';

interface HelloWorldCardProps {
  message?: string;
  subtitle?: string;
}

export function HelloWorldCard({
  message = 'Hello World',
  subtitle = 'Production-ready mobile foundation',
}: HelloWorldCardProps) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const { colors, spacing, typography } = theme;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.outline,
          padding: spacing.lg,
          maxWidth: wp(90),
        },
      ]}
    >
      <Text style={[typography.headline, styles.title]}>{message}</Text>
      <Text style={[typography.body, { marginTop: spacing.sm }]}>{subtitle}</Text>
      <Text style={[typography.caption, { marginTop: spacing.md }]}>
        React Native · Expo · Zustand · React Navigation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    textAlign: 'center',
  },
});
