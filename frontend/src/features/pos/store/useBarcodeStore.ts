import { create } from 'zustand';

interface BarcodeState {
  barcodeBuffer: string;
  appendChar: (char: string) => void;
  flushBarcode: () => string;
}

export const useBarcodeStore = create<BarcodeState>((set, get) => ({
  barcodeBuffer: '',
  appendChar: (char) => set((state) => ({ barcodeBuffer: state.barcodeBuffer + char })),
  flushBarcode: () => {
    const code = get().barcodeBuffer;
    set({ barcodeBuffer: '' });
    return code;
  },
}));
