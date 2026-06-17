import { create } from 'zustand';

import {
  analyzeReceiptImage,
  mapAiOcrToTransactionForm,
} from '../services/aiReceiptService';
import {
  AiReceiptError,
  AiReceiptStatus,
  TransactionForm,
} from '../types/transaction';

const EMPTY_FORM: TransactionForm = {
  amount: '',
  transactionDate: null,
  categoryId: null,
  note: '',
  receiptImageUri: null,
};

interface AiReceiptState {
  status: AiReceiptStatus;
  capturedImageUri: string | null;
  form: TransactionForm;
  error: AiReceiptError | null;
  startCapture: () => void;
  processCapturedImage: (imageUri: string) => Promise<void>;
  updateForm: (patch: Partial<TransactionForm>) => void;
  retryWithCurrentImage: () => Promise<void>;
  enterManually: () => void;
  reset: () => void;
}

export const useAiReceiptStore = create<AiReceiptState>((set, get) => ({
  status: 'idle',
  capturedImageUri: null,
  form: EMPTY_FORM,
  error: null,

  startCapture: () => {
    set({ status: 'capturing', error: null });
  },

  processCapturedImage: async (imageUri) => {
    set({
      status: 'uploading',
      capturedImageUri: imageUri,
      form: { ...EMPTY_FORM, receiptImageUri: imageUri },
      error: null,
    });

    try {
      set({ status: 'processing' });
      const result = await analyzeReceiptImage(imageUri);

      set({
        status: 'success',
        form: mapAiOcrToTransactionForm(result, imageUri),
      });
    } catch {
      set({
        status: 'error',
        error: {
          title: 'Khong the nhan dien hoa don',
          message:
            'AI chua xu ly duoc anh nay. Ban co the chup lai hoac nhap thu cong.',
        },
      });
    }
  },

  updateForm: (patch) => {
    set((state) => ({
      form: {
        ...state.form,
        ...patch,
      },
    }));
  },

  retryWithCurrentImage: async () => {
    const imageUri = get().capturedImageUri;
    if (!imageUri) {
      set({ status: 'idle' });
      return;
    }

    await get().processCapturedImage(imageUri);
  },

  enterManually: () => {
    const imageUri = get().capturedImageUri;
    set({
      status: 'success',
      error: null,
      form: {
        ...EMPTY_FORM,
        receiptImageUri: imageUri,
      },
    });
  },

  reset: () => {
    set({
      status: 'idle',
      capturedImageUri: null,
      form: EMPTY_FORM,
      error: null,
    });
  },
}));
