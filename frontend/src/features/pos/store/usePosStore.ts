/* eslint-disable typescript.react.portability.i18next.jsx-not-internationalized.jsx-not-internationalized */
import { create } from 'zustand';

export interface PosState {
  activeInvoiceId: string | null;
  setActiveInvoiceId: (id: string | null) => void;
}

export const usePosStore = create<PosState>((set) => ({
  activeInvoiceId: null,
  setActiveInvoiceId: (id) => set({ activeInvoiceId: id }),
}));
