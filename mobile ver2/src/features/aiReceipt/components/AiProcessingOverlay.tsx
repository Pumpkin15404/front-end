import { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';

import { AiReceiptStatus } from '../types/transaction';

interface AiProcessingOverlayProps {
  visible: boolean;
  status: AiReceiptStatus;
}

const STATUS_TEXT: Partial<Record<AiReceiptStatus, string>> = {
  uploading: 'Dang tai anh len...',
  processing: 'AI dang nhan dien thong tin...',
};

export function AiProcessingOverlay({
  visible,
  status,
}: AiProcessingOverlayProps) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors, spacing } = colorScheme === 'dark' ? darkTheme : lightTheme;
  const opacityValue = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!visible) {
      opacityValue.stopAnimation();
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityValue, {
          toValue: 1,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacityValue, {
          toValue: 0.45,
          duration: 850,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [opacityValue, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.panel, { backgroundColor: colors.surface, padding: spacing.lg }]}>
          <Animated.View
            style={[
              styles.loadingDot,
              { backgroundColor: colors.primary, opacity: opacityValue },
            ]}
          />
          <Text style={[styles.title, { color: colors.onSurface }]}>
            Dang phan tich hoa don...
          </Text>
          <Text style={[styles.description, { color: colors.outline }]}>
            {STATUS_TEXT[status] ?? 'Vui long cho trong giay lat.'}
          </Text>

          <View style={[styles.skeletonGroup, { marginTop: spacing.lg }]}>
            <Animated.View style={[styles.skeletonLarge, { opacity: opacityValue }]} />
            <Animated.View style={[styles.skeletonMedium, { opacity: opacityValue }]} />
            <Animated.View style={[styles.skeletonSmall, { opacity: opacityValue }]} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
    padding: 24,
  },
  panel: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 12,
  },
  loadingDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  skeletonGroup: {
    gap: 10,
  },
  skeletonLarge: {
    width: '88%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DADCE0',
  },
  skeletonMedium: {
    width: '72%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
  },
  skeletonSmall: {
    width: '54%',
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E5E7EB',
  },
});
