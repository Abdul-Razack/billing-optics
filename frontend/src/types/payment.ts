export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
export type PaymentStatus = "COMPLETED" | "PENDING" | "FAILED" | "REFUNDED";

export interface Payment {
  id: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  referenceNumber?: string; // Transaction ID, Check number, etc.
  date: string;
  notes?: string;
  recordedBy: string; // User ID
}

export interface PendingPayment {
  customerId: string;
  totalOutstanding: number;
  oldestInvoiceDate: string;
  invoiceCount: number;
}
