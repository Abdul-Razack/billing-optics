export const INVOICE_STATUS = {
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  UNPAID: 'UNPAID',
  CANCELLED: 'CANCELLED',
} as const;

export type InvoiceStatus = keyof typeof INVOICE_STATUS;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  CARD: 'CARD',
  UPI: 'UPI',
  NET_BANKING: 'NET_BANKING',
  MIXED: 'MIXED',
} as const;

export type PaymentMethod = keyof typeof PAYMENT_METHODS;
export default INVOICE_STATUS;
