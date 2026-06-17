export type AiReceiptStatus =
  | 'idle'
  | 'capturing'
  | 'uploading'
  | 'processing'
  | 'success'
  | 'error';

export interface TransactionCategory {
  id: string;
  name: string;
}

export interface TransactionForm {
  amount: string;
  transactionDate: Date | null;
  categoryId: string | null;
  note: string;
  receiptImageUri: string | null;
}

export interface AiOcrResponse {
  amount?: number | string | null;
  transactionDate?: string | null;
  category?: TransactionCategory | null;
  merchantName?: string | null;
  description?: string | null;
}

export interface AiReceiptError {
  title: string;
  message: string;
}
