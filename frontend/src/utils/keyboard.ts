import { usePaymentStore } from '../core/store/payment.store';
import { printReceipt } from '../features/receipts/utils/receipt-printer';
import { usePosStore } from '../features/pos/store/usePosStore';

export const HOTKEYS = {
  SEARCH_PRODUCT: 'F1',
  PAYMENT_MODAL: 'F9',
  SUSPEND_CART: 'F8',
  ATTACH_CUSTOMER: 'F3',
  PRINT_RECEIPT: 'F10',
  CLOSE_MODAL: 'Escape',
} as const;

export type HotkeyType = typeof HOTKEYS[keyof typeof HOTKEYS];

class KeyboardManager {
  private listeners: Record<string, (() => void)[]> = {};

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        const matchedHotkey = Object.values(HOTKEYS).find((key) => key === e.key);
        if (matchedHotkey && this.listeners[matchedHotkey] && this.listeners[matchedHotkey].length > 0) {
          e.preventDefault();
          this.listeners[matchedHotkey].forEach((callback) => {
            try {
              callback();
            } catch (err) {
              console.error('Error executing hotkey callback:', err);
            }
          });
        }
      });
    }
  }

  register(hotkey: HotkeyType, callback: () => void): () => void {
    if (!this.listeners[hotkey]) {
      this.listeners[hotkey] = [];
    }
    this.listeners[hotkey].push(callback);

    return () => {
      this.listeners[hotkey] = this.listeners[hotkey].filter((cb) => cb !== callback);
    };
  }
}

export const keyboardManager = new KeyboardManager();

let isInitialized = false;

export function initializeGlobalHotkeys() {
  if (isInitialized) return;
  isInitialized = true;

  keyboardManager.register(HOTKEYS.PAYMENT_MODAL, () => {
    usePaymentStore.getState().setIsOpen(true);
  });

  keyboardManager.register(HOTKEYS.PRINT_RECEIPT, () => {
    const activeId = usePosStore.getState().activeInvoiceId;
    if (activeId) {
      printReceipt(activeId);
    }
  });
}

