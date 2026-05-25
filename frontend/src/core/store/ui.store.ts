/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { create } from 'zustand';

export interface UiState {
  activeInvoiceId: string | null;
  isPaymentModalOpen: boolean;
  barcodeBuffer: string;
  setActiveInvoice: (id: string | null) => void;
  setPaymentModalOpen: (isOpen: boolean) => void;
  appendBarcode: (char: string) => void;
  flushBarcode: () => string;
}

export const useUiStore = create<UiState>((set, get) => ({
  activeInvoiceId: null,
  isPaymentModalOpen: false,
  barcodeBuffer: '',
  setActiveInvoice: (id) => set({ activeInvoiceId: id }),
  setPaymentModalOpen: (isOpen) => set({ isPaymentModalOpen: isOpen }),
  appendBarcode: (char) => set((state) => ({ barcodeBuffer: state.barcodeBuffer + char })),
  flushBarcode: () => {
    const buffer = get().barcodeBuffer;
    set({ barcodeBuffer: '' });
    return buffer;
  },
}));
