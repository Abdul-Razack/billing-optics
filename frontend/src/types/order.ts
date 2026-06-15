export type PaymentStatus = "UNPAID" | "PARTIAL" | "PAID";
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "BANK_TRANSFER";
export type OrderStatus = "DRAFT" | "COMPLETED" | "CANCELLED" | "REFUNDED";
export type DeliveryStatus = "PENDING" | "READY" | "DELIVERED";

export interface ApiInvoiceLine {
  id: string;
  productId: number;
  productName?: string; // Appended by frontend/mock
  productSku?: string; // Appended by frontend/mock
  quantity: number;
  unitPrice: number;
  subtotal: number;
  gstPercent?: number;
}

export interface ApiPayment {
  id?: number;
  invoiceId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  createdAt?: string;
}

import { Offer } from "./offer";

export interface ApiInvoice {
  id: number;
  invoiceNumber: string;
  requestId?: string;
  customerId?: number;
  customerName?: string; // Appended by frontend/mock
  createdBy: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  status?: OrderStatus; // Added by frontend for module completeness
  notes?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string; // Mocked
  itemCount?: number; // Mocked
  offerId?: number;
  offer?: Offer;
  lines?: ApiInvoiceLine[];
  payments?: ApiPayment[];
}
