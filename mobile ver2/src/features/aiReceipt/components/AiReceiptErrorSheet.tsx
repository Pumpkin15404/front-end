import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';

import { AiReceiptError } from '../types/transaction';

interface AiReceiptErrorSheetProps {
  visible: boolean;
  error: AiReceiptError | null;
  onRetry: () => void;
  onRetake: () => void;
  onManualInput: () => void;
}

export function AiReceiptErrorSheet({
  visible,
  error,
  onRetry,
  onRetake,
  onManualInput,
}: AiReceiptErrorSheetProps) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors, spacing } = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: colors.surface, padding: spacing.lg }]}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {error?.title}
          </Text>
          <Text style={[styles.message, { color: colors.outline }]}>
            {error?.message}
          </Text>

          <View style={[styles.actions, { gap: spacing.sm, marginTop: spacing.lg }]}>
            <SheetButton label="Thu lai" variant="primary" onPress={onRetry} />
            <SheetButton label="Chup lai" onPress={onRetake} />
            <SheetButton label="Nhap thu cong" onPress={onManualInput} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface SheetButtonProps {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress: () => void;
}

function SheetButton({ label, variant = 'secondary', onPress }: SheetButtonProps) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors } = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: isPrimary ? colors.primary : 'transparent',
          borderColor: colors.outline,
          borderWidth: isPrimary ? 0 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          { color: isPrimary ? colors.onPrimary : colors.onSurface },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.36)',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  actions: {},
  button: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
