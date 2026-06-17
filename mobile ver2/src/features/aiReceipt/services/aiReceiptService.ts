import { AiOcrResponse, TransactionForm } from '../types/transaction';

const AI_OCR_ENDPOINT = 'https://api.example.com/ai/ocr/receipts';

export async function analyzeReceiptImage(imageUri: string): Promise<AiOcrResponse> {
  const formData = new FormData();

  formData.append('image', {
    uri: imageUri,
    name: `receipt-${Date.now()}.jpg`,
    type: 'image/jpeg',
  } as unknown as Blob);

  const response = await fetch(AI_OCR_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('AI OCR service failed');
  }

  return response.json();
}

export function mapAiOcrToTransactionForm(
  result: AiOcrResponse,
  receiptImageUri: string,
): TransactionForm {
  return {
    amount: normalizeAmount(result.amount),
    transactionDate: parseTransactionDate(result.transactionDate),
    categoryId: result.category?.id ?? null,
    note: [result.merchantName, result.description].filter(Boolean).join(' - '),
    receiptImageUri,
  };
}

function normalizeAmount(value: AiOcrResponse['amount']): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/[^\d.-]/g, ''));

  if (!Number.isFinite(numericValue)) {
    return '';
  }

  return String(Math.round(numericValue));
}

function parseTransactionDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const isoDate = new Date(value);
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const dateParts = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!dateParts) {
    return null;
  }

  const [, day, month, year] = dateParts;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}
