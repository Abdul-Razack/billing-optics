import { z } from 'zod';
import { createInvoiceSchema } from '../validators/billing.validator';

export type CreateInvoicePayload = z.infer<typeof createInvoiceSchema>['body'];

export interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  customerId?: string | null;
  prescriptionId?: string | null;
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  status: string;
  createdAt: Date;
}
