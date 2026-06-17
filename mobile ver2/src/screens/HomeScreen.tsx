import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HelloWorldCard } from '@/components/HelloWorldCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { helloService } from '@/services/helloService';
import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';
import { hp } from '@/utils/responsive';

export function HomeScreen() {
  const [message, setMessage] = useState('Hello World');
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const toggleColorScheme = useThemeStore((s) => s.toggleColorScheme);
  const { colors, spacing } = colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    helloService.fetchMessage().then((res) => setMessage(res.message));
  }, []);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.content, { padding: spacing.lg, paddingTop: hp(8) }]}>
        <HelloWorldCard message={message} />
        <View style={{ marginTop: spacing.xl }}>
          <PrimaryButton label="Toggle theme" onPress={toggleColorScheme} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
});
