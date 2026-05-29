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

export interface ApiInvoice {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  createdBy: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  paymentStatus: string;
  status: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedApiInvoiceResponse {
  data: ApiInvoice[];
  meta: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

export interface ApiInvoiceDetail {
  id: number;
  invoiceNumber: string;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  amountPaid: number;
  paymentStatus: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email: string | null;
    address: string | null;
  } | null;
  items: {
    productId: number;
    snapshotSku: string;
    snapshotName: string;
    quantity: number;
    unitPrice: number;
    gstPercent: number;
    subtotal: number;
  }[];
  payments: {
    amount: number;
    paymentMethod: string;
    referenceNumber: string | null;
    notes: string | null;
    createdAt: string;
  }[];
  createdBy: {
    id: number;
    fullName: string;
    role: string;
  };
}
