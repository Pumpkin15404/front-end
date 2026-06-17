import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Transaction,
  transactionService,
} from '@/services/transactionService';
import { useThemeStore } from '@/state_management/themeStore';
import { darkTheme, lightTheme } from '@/theme';

interface TransactionSection {
  dateKey: string;
  title: string;
  total: number;
  data: Transaction[];
}

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
});

function getTransactionDate(transaction: Transaction) {
  const rawDate = transaction.created_at || transaction.transaction_date;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();

  return Number.isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
}

function getDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function getThumbnailUrl(transaction: Transaction) {
  return transaction.thumbnail_url || transaction.images?.[0]?.image_url || null;
}

function getAmount(transaction: Transaction) {
  const amount =
    typeof transaction.amount === 'number'
      ? transaction.amount
      : Number(transaction.amount);

  return Number.isFinite(amount) ? amount : 0;
}

function groupExpenseTransactions(transactions: Transaction[]): TransactionSection[] {
  const groups = new Map<string, Transaction[]>();

  transactions
    .filter((transaction) => transaction.transaction_type !== 'income')
    .sort(
      (left, right) =>
        getTransactionDate(right).getTime() - getTransactionDate(left).getTime(),
    )
    .forEach((transaction) => {
      const date = getTransactionDate(transaction);
      const dateKey = getDateKey(date);
      const dayTransactions = groups.get(dateKey) ?? [];

      dayTransactions.push(transaction);
      groups.set(dateKey, dayTransactions);
    });

  return Array.from(groups.entries()).map(([dateKey, data]) => {
    const date = getTransactionDate(data[0]);

    return {
      dateKey,
      title: dateFormatter.format(date),
      total: data.reduce((sum, transaction) => sum + getAmount(transaction), 0),
      data,
    };
  });
}

export function TransactionHistoryScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useThemeStore((s) => s.colorScheme);
  const { colors, spacing, typography } =
    colorScheme === 'dark' ? darkTheme : lightTheme;

  const sections = useMemo(
    () => groupExpenseTransactions(transactions),
    [transactions],
  );

  const loadTransactions = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const nextTransactions = await transactionService.fetchTransactions();
      setTransactions(nextTransactions);
    } catch {
      setError('Khong the tai lich su giao dich');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const renderSectionHeader = useCallback(
    ({ section }: { section: TransactionSection }) => (
      <View
        style={[
          styles.sectionHeader,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.outline,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          },
        ]}
      >
        <View>
          <Text style={[styles.sectionTitle, { color: colors.onBackground }]}>
            {section.title}
          </Text>
          <Text style={[typography.caption, { marginTop: 2 }]}>
            {section.data.length} khoan chi
          </Text>
        </View>
        <Text style={[styles.sectionTotal, { color: colors.error }]}>
          {currencyFormatter.format(section.total)}
        </Text>
      </View>
    ),
    [colors, spacing, typography.caption],
  );

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => {
      const thumbnailUrl = getThumbnailUrl(item);
      const date = getTransactionDate(item);
      const title = item.merchant || item.note || item.category_name || 'Khoan chi';
      const subtitle = [item.category_name, timeFormatter.format(date)]
        .filter(Boolean)
        .join(' - ');

      return (
        <View
          style={[
            styles.transactionRow,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.outline,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            },
          ]}
        >
          {thumbnailUrl ? (
            <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
          ) : (
            <View
              style={[
                styles.thumbnailFallback,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[styles.thumbnailText, { color: colors.onPrimary }]}>
                {title.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.transactionInfo}>
            <Text
              numberOfLines={1}
              style={[styles.transactionTitle, { color: colors.onSurface }]}
            >
              {title}
            </Text>
            <Text
              numberOfLines={1}
              style={[typography.caption, { marginTop: spacing.xs }]}
            >
              {subtitle}
            </Text>
            {item.note && item.merchant ? (
              <Text
                numberOfLines={1}
                style={[typography.caption, { marginTop: spacing.xs }]}
              >
                {item.note}
              </Text>
            ) : null}
          </View>

          <Text style={[styles.amount, { color: colors.error }]}>
            -{currencyFormatter.format(getAmount(item))}
          </Text>
        </View>
      );
    },
    [colors, spacing, typography.caption],
  );

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.centered, { backgroundColor: colors.background }]}
        edges={['left', 'right', 'bottom']}
      >
        <ActivityIndicator color={colors.primary} />
        <Text style={[typography.body, { marginTop: spacing.md }]}>
          Dang tai lich su giao dich...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[styles.header, { padding: spacing.lg }]}>
        <Text style={typography.headline}>Lich su giao dich</Text>
        <Text style={[typography.body, { marginTop: spacing.sm }]}>
          Theo doi cac khoan chi duoc gom nhom theo tung ngay.
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorBox, { marginHorizontal: spacing.lg }]}>
          <Text style={[typography.body, { color: colors.error }]}>{error}</Text>
          <Pressable onPress={() => loadTransactions()} style={styles.retryButton}>
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Thu lai
            </Text>
          </Pressable>
        </View>
      ) : null}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        stickySectionHeadersEnabled
        contentContainerStyle={[
          styles.listContent,
          sections.length === 0 ? styles.emptyListContent : null,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadTransactions(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.onBackground }]}>
              Chua co khoan chi nao
            </Text>
            <Text style={[typography.body, styles.emptyMessage]}>
              Cac giao dich se hien thi tai day sau khi duoc ghi nhan.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  sectionTotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  thumbnail: {
    borderRadius: 10,
    height: 56,
    width: 56,
  },
  thumbnailFallback: {
    alignItems: 'center',
    borderRadius: 10,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  thumbnailText: {
    fontSize: 22,
    fontWeight: '700',
  },
  transactionInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyMessage: {
    marginTop: 8,
    textAlign: 'center',
  },
  errorBox: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  retryButton: {
    marginTop: 8,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
