import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton, TextInputField } from '@/components';
import { ApiError } from '@/services/apiClient';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/state_management/authStore';
import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';
import { OFFLINE_MESSAGE } from '@/utils/network';
import {
  validateEmail,
  validateLoginForm,
  validatePassword,
} from '@/utils/validation';

import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [passwordError, setPasswordError] = useState<string>();
  const [formError, setFormError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const colorScheme = useThemeStore((s) => s.colorScheme);
  const sessionMessage = useAuthStore((s) => s.sessionMessage);
  const setSessionMessage = useAuthStore((s) => s.setSessionMessage);
  const { colors, spacing, typography } =
    colorScheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const message = route.params?.sessionMessage ?? sessionMessage;
    if (message) {
      Alert.alert('Thông báo', message);
      setSessionMessage(null);
    }
  }, [route.params?.sessionMessage, sessionMessage, setSessionMessage]);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    setEmailError(undefined);
    setFormError(undefined);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    setPasswordError(undefined);
    setFormError(undefined);
  }, []);

  const handleEmailBlur = useCallback(() => {
    setEmailError(validateEmail(email));
  }, [email]);

  const handlePasswordBlur = useCallback(() => {
    setPasswordError(validatePassword(password));
  }, [password]);

  const handleLogin = useCallback(async () => {
    const errors = validateLoginForm({ email, password });
    setEmailError(errors.email);
    setPasswordError(errors.password);
    setFormError(undefined);

    if (errors.email || errors.password) {
      return;
    }

    setLoading(true);

    try {
      await authService.login({
        email: email.trim(),
        password,
      });
      navigation.replace('Dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 0) {
          setFormError(OFFLINE_MESSAGE);
        } else if (error.status === 401) {
          setFormError('Email hoặc mật khẩu không đúng');
        } else {
          setFormError(error.message || 'Đăng nhập thất bại, vui lòng thử lại');
        }
      } else {
        setFormError('Đăng nhập thất bại, vui lòng thử lại');
      }
    } finally {
      setLoading(false);
    }
  }, [email, navigation, password]);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { padding: spacing.lg }]}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={typography.headline}>Đăng nhập</Text>
          <Text
            style={[
              typography.body,
              { marginTop: spacing.sm, marginBottom: spacing.xl },
            ]}
          >
            Quản lý chi tiêu cá nhân với MoneyHabits
          </Text>

          {__DEV__ ? (
            <Text
              style={[
                typography.caption,
                { marginBottom: spacing.lg, color: colors.outline },
              ]}
            >
              Demo: demo@moneyhabits.app / demo123
            </Text>
          ) : null}

          <TextInputField
            label="Email"
            value={email}
            onChangeText={handleEmailChange}
            onBlur={handleEmailBlur}
            error={emailError}
            keyboardType="email-address"
          />

          <TextInputField
            label="Mật khẩu"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={handlePasswordBlur}
            error={passwordError}
            secureTextEntry
          />

          {formError ? (
            <Text
              style={[
                typography.caption,
                { color: colors.error, marginBottom: spacing.md },
              ]}
            >
              {formError}
            </Text>
          ) : null}

          <PrimaryButton
            label="Đăng nhập"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
