import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';

import { TransactionCategory, TransactionForm } from '../types/transaction';

interface TransactionAutoFillFormProps {
  form: TransactionForm;
  categories: TransactionCategory[];
  onChange: (patch: Partial<TransactionForm>) => void;
  onSave: () => void;
}

export function TransactionAutoFillForm({
  form,
  categories,
  onChange,
  onSave,
}: TransactionAutoFillFormProps) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors, spacing } = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { gap: spacing.sm }]}>
      <Text style={[styles.heading, { color: colors.onBackground }]}>
        Xac nhan giao dich
      </Text>

      <FieldLabel label="So tien" />
      <TextInput
        value={form.amount}
        onChangeText={(amount) => onChange({ amount })}
        keyboardType="number-pad"
        placeholder="Nhap so tien"
        placeholderTextColor={colors.outline}
        style={[styles.input, { borderColor: colors.outline, color: colors.onSurface }]}
      />

      <FieldLabel label="Ngay giao dich" />
      <TextInput
        value={formatDateInput(form.transactionDate)}
        onChangeText={(value) => onChange({ transactionDate: parseDateInput(value) })}
        placeholder="DD/MM/YYYY"
        placeholderTextColor={colors.outline}
        style={[styles.input, { borderColor: colors.outline, color: colors.onSurface }]}
      />

      <FieldLabel label="Danh muc" />
      <View style={styles.categoryList}>
        {categories.map((category) => {
          const selected = category.id === form.categoryId;

          return (
            <Pressable
              key={category.id}
              onPress={() => onChange({ categoryId: category.id })}
              style={[
                styles.categoryChip,
                {
                  borderColor: selected ? colors.primary : colors.outline,
                  backgroundColor: selected ? colors.primary : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selected ? colors.onPrimary : colors.onSurface },
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FieldLabel label="Ghi chu" />
      <TextInput
        value={form.note}
        onChangeText={(note) => onChange({ note })}
        placeholder="Nhap mo ta giao dich"
        placeholderTextColor={colors.outline}
        multiline
        style={[
          styles.input,
          styles.noteInput,
          { borderColor: colors.outline, color: colors.onSurface },
        ]}
      />

      <Pressable
        onPress={onSave}
        style={[styles.saveButton, { backgroundColor: colors.primary, marginTop: spacing.md }]}
      >
        <Text style={[styles.saveButtonText, { color: colors.onPrimary }]}>
          Luu giao dich
        </Text>
      </Pressable>
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors } = colorScheme === 'dark' ? darkTheme : lightTheme;

  return <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>;
}

function formatDateInput(date: Date | null): string {
  if (!date) {
    return '';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function parseDateInput(value: string): Date | null {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    paddingHorizontal: 12,
  },
  noteInput: {
    minHeight: 92,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  categoryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    alignItems: 'center',
    borderRadius: 12,
    minHeight: 50,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
