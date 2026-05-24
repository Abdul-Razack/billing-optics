import { create } from 'zustand';
import { PaymentMethod } from '../api/payment.types';

interface PaymentState {
  isOpen: boolean;
  activeMethod: PaymentMethod;
  enteredCash: string;
  reference: string;
  splitPayments: { method: PaymentMethod; amount: string }[];
  setIsOpen: (isOpen: boolean) => void;
  setActiveMethod: (method: PaymentMethod) => void;
  setEnteredCash: (amount: string) => void;
  setReference: (ref: string) => void;
  updateSplitPayment: (index: number, amount: string) => void;
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  isOpen: false,
  activeMethod: 'CASH',
  enteredCash: '',
  reference: '',
  splitPayments: [
    { method: 'CASH', amount: '' },
    { method: 'CARD', amount: '' },
  ],
  setIsOpen: (isOpen) => set({ isOpen, activeMethod: 'CASH', enteredCash: '', reference: '' }),
  setActiveMethod: (method) => set({ activeMethod: method }),
  setEnteredCash: (amount) => set({ enteredCash: amount }),
  setReference: (ref) => set({ reference: ref }),
  updateSplitPayment: (index, amount) => set((state) => {
    const split = [...state.splitPayments];
    split[index].amount = amount;
    return { splitPayments: split };
  }),
  reset: () => set({
    isOpen: false,
    activeMethod: 'CASH',
    enteredCash: '',
    reference: '',
    splitPayments: [{ method: 'CASH', amount: '' }, { method: 'CARD', amount: '' }],
  }),
}));
