import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AiReceiptErrorSheet } from '@/features/aiReceipt/components/AiReceiptErrorSheet';
import { AiProcessingOverlay } from '@/features/aiReceipt/components/AiProcessingOverlay';
import { TransactionAutoFillForm } from '@/features/aiReceipt/components/TransactionAutoFillForm';
import { useAiReceiptStore } from '@/features/aiReceipt/store/aiReceiptStore';
import { TransactionCategory } from '@/features/aiReceipt/types/transaction';
import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';

const CATEGORIES: TransactionCategory[] = [
  { id: 'food', name: 'An uong' },
  { id: 'shopping', name: 'Mua sam' },
  { id: 'transport', name: 'Di chuyen' },
  { id: 'bill', name: 'Hoa don' },
];

export function AiReceiptScannerScreen() {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors, spacing } = colorScheme === 'dark' ? darkTheme : lightTheme;
  const {
    status,
    capturedImageUri,
    form,
    error,
    startCapture,
    processCapturedImage,
    updateForm,
    retryWithCurrentImage,
    enterManually,
    reset,
  } = useAiReceiptStore();

  const isProcessing = status === 'uploading' || status === 'processing';

  const handleCapture = async () => {
    startCapture();

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      reset();
      Alert.alert('Can quyen camera', 'Vui long cap quyen camera de chup hoa don.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      reset();
      return;
    }

    await processCapturedImage(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!form.amount || !form.transactionDate) {
      Alert.alert('Thieu thong tin', 'Vui long kiem tra so tien va ngay giao dich.');
      return;
    }

    Alert.alert('Da san sang luu', 'Form giao dich da duoc xac nhan.');
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <View style={[styles.header, { padding: spacing.lg }]}>
          <Text style={[styles.title, { color: colors.onBackground }]}>
            Quet hoa don
          </Text>
          <Pressable
            onPress={handleCapture}
            style={[styles.captureButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.captureButtonText, { color: colors.onPrimary }]}>
              {capturedImageUri ? 'Chup lai' : 'Chup anh'}
            </Text>
          </Pressable>
        </View>

        {capturedImageUri ? (
          <Image source={{ uri: capturedImageUri }} style={styles.preview} />
        ) : (
          <Pressable
            onPress={handleCapture}
            style={[
              styles.emptyPreview,
              {
                borderColor: colors.outline,
                marginHorizontal: spacing.lg,
              },
            ]}
          >
            <Text style={[styles.emptyPreviewText, { color: colors.onSurface }]}>
              Chup hoa don de AI tu dien form
            </Text>
          </Pressable>
        )}

        {(status === 'success' || status === 'error') && (
          <TransactionAutoFillForm
            form={form}
            categories={CATEGORIES}
            onChange={updateForm}
            onSave={handleSave}
          />
        )}
      </ScrollView>

      <AiProcessingOverlay visible={isProcessing} status={status} />
      <AiReceiptErrorSheet
        visible={status === 'error'}
        error={error}
        onRetry={retryWithCurrentImage}
        onRetake={handleCapture}
        onManualInput={enterManually}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  captureButton: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  captureButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  preview: {
    alignSelf: 'center',
    borderRadius: 12,
    height: 220,
    marginBottom: 8,
    width: '88%',
  },
  emptyPreview: {
    alignItems: 'center',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    height: 180,
    justifyContent: 'center',
    marginBottom: 8,
    padding: 16,
  },
  emptyPreviewText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
});
