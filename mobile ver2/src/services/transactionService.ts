import { apiClient } from './apiClient';

export interface TransactionImage {
  id?: string;
  image_url: string;
}

export interface Transaction {
  id: string;
  amount: number | string;
  note?: string | null;
  merchant?: string | null;
  category_name?: string | null;
  transaction_type?: 'income' | 'expense';
  transaction_date?: string;
  created_at: string;
  thumbnail_url?: string | null;
  images?: TransactionImage[];
}

type TransactionsResponse = Transaction[] | { data: Transaction[] };

const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    amount: 85000,
    note: 'Ca phe sang',
    merchant: 'The Coffee House',
    category_name: 'An uong',
    transaction_type: 'expense',
    created_at: new Date('2026-06-12T08:15:00+07:00').toISOString(),
    thumbnail_url: 'https://picsum.photos/seed/coffee/128/128',
  },
  {
    id: 'txn-002',
    amount: 42000,
    note: 'Banh mi',
    merchant: 'Banh mi Ba Lan',
    category_name: 'An uong',
    transaction_type: 'expense',
    created_at: new Date('2026-06-12T12:05:00+07:00').toISOString(),
  },
  {
    id: 'txn-003',
    amount: 185000,
    note: 'Do dung ca nhan',
    merchant: 'Guardian',
    category_name: 'Mua sam',
    transaction_type: 'expense',
    created_at: new Date('2026-06-11T19:30:00+07:00').toISOString(),
    images: [{ image_url: 'https://picsum.photos/seed/guardian/128/128' }],
  },
  {
    id: 'txn-004',
    amount: 320000,
    note: 'Di sieu thi',
    merchant: 'WinMart',
    category_name: 'Nhu yeu pham',
    transaction_type: 'expense',
    created_at: new Date('2026-06-10T18:45:00+07:00').toISOString(),
    thumbnail_url: 'https://picsum.photos/seed/market/128/128',
  },
];

function normalizeTransactions(response: TransactionsResponse): Transaction[] {
  return Array.isArray(response) ? response : response.data;
}

export const transactionService = {
  async fetchTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient<TransactionsResponse>('/transactions');
      return normalizeTransactions(response);
    } catch {
      return mockTransactions;
    }
  },
};
