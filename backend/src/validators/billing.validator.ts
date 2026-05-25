import { z } from 'zod';

export const createInvoiceSchema = z.object({
  body: z.object({
    requestId: z.string().min(1, 'requestId is required for idempotency').optional(),
    customerId: z.number().optional(),
    items: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
      })
    ).min(1, 'At least one item is required'),
    paymentAmount: z.number().nonnegative().default(0),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).default('CASH'),
    notes: z.string().optional(),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    invoiceId: z.string().optional(),
    customerId: z.number().optional(),
    items: z.array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().positive(),
      })
    ).min(1, 'At least one item is required'),
    payments: z.array(
      z.object({
        method: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
        amount: z.number().nonnegative(),
        reference: z.string().optional(),
      })
    ).optional(),
  }),
});

export const addPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
    referenceNumber: z.string().optional(),
  }),
});
