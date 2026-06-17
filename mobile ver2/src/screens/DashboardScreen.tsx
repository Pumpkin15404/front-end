import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HelloWorldCard } from '@/components/HelloWorldCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { RootStackParamList } from '@/navigation/types';
import { helloService } from '@/services/helloService';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/state_management/authStore';
import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';
import { hp } from '@/utils/responsive';

export function DashboardScreen() {
  const [message, setMessage] = useState('Xin chào!');
  const [loggingOut, setLoggingOut] = useState(false);

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((s) => s.user);
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const toggleColorScheme = useThemeStore((s) => s.toggleColorScheme);
  const { colors, spacing, typography } =
    colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    helloService.fetchMessage().then((res) => setMessage(res.message));
  }, []);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setLoggingOut(false);
    }
  }, []);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.content, { padding: spacing.lg, paddingTop: hp(4) }]}>
        <Text style={typography.headline}>Dashboard</Text>
        {user ? (
          <Text style={[typography.body, { marginTop: spacing.sm }]}>
            {user.name ?? user.email}
          </Text>
        ) : null}

        <View style={{ marginTop: spacing.xl }}>
          <HelloWorldCard message={message} />
        </View>

        <View style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <PrimaryButton
            label="Quet hoa don bang AI"
            onPress={() => navigation.navigate('AiReceiptScanner')}
          />
          <PrimaryButton
            label="Lich su giao dich"
            onPress={() => navigation.navigate('TransactionHistory')}
          />
          <PrimaryButton label="Toggle theme" onPress={toggleColorScheme} />
          <PrimaryButton
            label="Đăng xuất"
            onPress={handleLogout}
            loading={loggingOut}
            disabled={loggingOut}
          />
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
  },
});
