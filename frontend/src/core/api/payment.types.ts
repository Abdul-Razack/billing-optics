export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'SPLIT';

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  createdAt: string;
}

export interface InvoiceTotals {
  subtotal: number;
  tax: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
}
