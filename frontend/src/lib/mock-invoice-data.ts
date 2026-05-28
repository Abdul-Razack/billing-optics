import { Invoice } from "@/types/invoice";

export const MOCK_INVOICES: Invoice[] = [
  {
    id: "inv_1",
    invoiceNumber: "INV-2023-1001",
    customerId: "cust_1", // John Doe
    date: "2023-10-15T10:30:00Z",
    dueDate: "2023-10-30T10:30:00Z",
    items: [
      {
        id: "item_1",
        productId: "prod_1", // Ray-Ban Aviator Classic
        productName: "Ray-Ban Aviator Classic",
        sku: "RB3025",
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00,
      },
      {
        id: "item_2",
        productId: "prod_5", // Microfiber Cleaning Cloth
        productName: "Microfiber Cleaning Cloth",
        sku: "ACC-MCC",
        quantity: 2,
        unitPrice: 5.00,
        total: 10.00,
      }
    ],
    subtotal: 160.00,
    gstTotal: 19.20,
    discountTotal: 0,
    grandTotal: 179.20,
    amountPaid: 179.20,
    status: "COMPLETED",
    paymentStatus: "PAID",
    payments: [
      {
        id: "pay_1",
        date: "2023-10-15T10:35:00Z",
        amount: 179.20,
        method: "CARD",
        referenceNumber: "TXN-8839201"
      }
    ]
  },
  {
    id: "inv_2",
    invoiceNumber: "INV-2023-1002",
    customerId: "cust_2", // Jane Smith
    date: "2023-11-02T14:15:00Z",
    items: [
      {
        id: "item_3",
        productId: "prod_2", // Acuvue Oasys 1-Day
        productName: "Acuvue Oasys 1-Day",
        sku: "ACV-O1D",
        quantity: 4,
        unitPrice: 35.00,
        total: 140.00,
      }
    ],
    subtotal: 140.00,
    gstTotal: 7.00,
    discountTotal: 10.00, // $10 off
    grandTotal: 137.00,
    amountPaid: 50.00,
    status: "COMPLETED",
    paymentStatus: "PARTIAL",
    payments: [
      {
        id: "pay_2",
        date: "2023-11-02T14:20:00Z",
        amount: 50.00,
        method: "CASH",
      }
    ]
  },
  {
    id: "inv_3",
    invoiceNumber: "INV-2023-1003",
    customerId: "cust_3", // Robert Johnson
    date: "2023-11-20T09:00:00Z",
    items: [
      {
        id: "item_4",
        productId: "prod_4", // Oakley Holbrook
        productName: "Oakley Holbrook",
        sku: "OKL-HOL",
        quantity: 1,
        unitPrice: 130.00,
        total: 130.00,
      }
    ],
    subtotal: 130.00,
    gstTotal: 15.60,
    discountTotal: 0,
    grandTotal: 145.60,
    amountPaid: 0,
    status: "DRAFT",
    paymentStatus: "PENDING",
    payments: []
  },
  {
    id: "inv_4",
    invoiceNumber: "INV-2023-1004",
    customerId: "cust_5", // Michael Wilson
    date: "2023-11-22T11:45:00Z",
    items: [
      {
        id: "item_5",
        productId: "prod_1",
        productName: "Ray-Ban Aviator Classic",
        sku: "RB3025",
        quantity: 1,
        unitPrice: 150.00,
        total: 150.00,
      }
    ],
    subtotal: 150.00,
    gstTotal: 18.00,
    discountTotal: 0,
    grandTotal: 168.00,
    amountPaid: 0,
    status: "CANCELLED",
    paymentStatus: "PENDING",
    notes: "Customer cancelled order.",
    payments: []
  }
];
