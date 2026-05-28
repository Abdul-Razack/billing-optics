export type InvoiceStatus = "DRAFT" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";

export interface InvoiceItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  date: string;
  dueDate?: string;
  items: InvoiceItem[];
  subtotal: number;
  gstTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  payments: Payment[];
  notes?: string;
}
