import { Payment, PendingPayment } from "@/types/payment";

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay_1",
    invoiceId: "INV-2023-001",
    customerId: "cust_1",
    amount: 1500.00,
    method: "UPI",
    status: "COMPLETED",
    referenceNumber: "UPI1234567890",
    date: "2023-11-01T10:30:00Z",
    recordedBy: "user_1",
  },
  {
    id: "pay_2",
    invoiceId: "INV-2023-002",
    customerId: "cust_2",
    amount: 450.50,
    method: "CASH",
    status: "COMPLETED",
    date: "2023-11-02T14:15:00Z",
    recordedBy: "user_2",
  },
  {
    id: "pay_3",
    invoiceId: "INV-2023-003",
    customerId: "cust_1",
    amount: 2000.00,
    method: "CARD",
    status: "COMPLETED",
    referenceNumber: "TXN987654321",
    date: "2023-11-05T09:45:00Z",
    recordedBy: "user_1",
  },
  {
    id: "pay_4",
    invoiceId: "INV-2023-004",
    customerId: "cust_3",
    amount: 300.00,
    method: "BANK_TRANSFER",
    status: "PENDING",
    referenceNumber: "NEFT-1122334455",
    date: "2023-11-06T11:20:00Z",
    recordedBy: "user_1",
  }
];

export const MOCK_PENDING_PAYMENTS: PendingPayment[] = [
  {
    customerId: "cust_3",
    totalOutstanding: 1250.00,
    oldestInvoiceDate: "2023-10-15T00:00:00Z",
    invoiceCount: 2
  },
  {
    customerId: "cust_2",
    totalOutstanding: 400.00,
    oldestInvoiceDate: "2023-11-01T00:00:00Z",
    invoiceCount: 1
  }
];
