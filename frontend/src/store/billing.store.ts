import { create } from 'zustand';

interface BillingState {
  cart: any[];
  customerId: string | null;
  prescriptionId: string | null;
  discountAmount: number;
  addToCart: (item: any) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setCustomer: (id: string | null) => void;
  setPrescription: (id: string | null) => void;
  setDiscount: (amount: number) => void;
}

export const useBillingStore = create<BillingState>((set) => ({
  cart: [],
  customerId: null,
  prescriptionId: null,
  discountAmount: 0,
  addToCart: (item) => set((state) => ({ cart: [...state.cart, item] })),
  removeFromCart: (productId) =>
    set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),
  clearCart: () => set({ cart: [], customerId: null, prescriptionId: null, discountAmount: 0 }),
  setCustomer: (customerId) => set({ customerId }),
  setPrescription: (prescriptionId) => set({ prescriptionId }),
  setDiscount: (discountAmount) => set({ discountAmount }),
}));

export default useBillingStore;
