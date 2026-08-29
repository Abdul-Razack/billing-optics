import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

export const createInvoiceSchema = z.object({
  body: z.object({
    requestId: z.string().trim().min(1, 'requestId is required for idempotency').optional(),
    customerId: z.number().int().positive().optional(),
    items: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(10000, 'Quantity too large'),
      })
    ).min(1, 'At least one item is required').max(500, 'Too many items'),
    paymentAmount: z.number().nonnegative().max(10000000, 'Amount too large').default(0),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).default('CASH'),
    notes: z.string().trim().max(1000).optional(),
  }),
});

export const checkoutSchema = z.object({
  body: z.object({
    action: z.enum(['SAVE_AS_ORDER', 'DIRECT_INVOICE']).optional(),
    invoiceId: z.string().trim().optional(),
    customerId: z.number().int().positive().optional(),
    items: z.array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(10000, 'Quantity too large'),
        employeeName: z.string().trim().max(100).optional(),
      })
    ).min(1, 'At least one item is required').max(500, 'Too many items'),
    payments: z.array(
      z.object({
        method: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
        amount: z.number().nonnegative().max(10000000),
        reference: z.string().trim().max(100).optional(),
      })
    ).optional(),
  }),
});

export const addPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive().max(10000000),
    paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']),
    referenceNumber: z.string().trim().max(100).optional(),
  }),
});

export const getInvoicesSchema = z.object({
  query: paginationQuerySchema.merge(
    z.object({
      status: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['DRAFT', 'COMPLETED', 'CANCELLED']).optional()
      ),
      paymentStatus: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['UNPAID', 'PARTIAL', 'PAID', 'REFUNDED', 'all']).optional()
      ),
      sortBy: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['date', 'amount', 'customer']).optional()
      ),
      sortDirection: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['asc', 'desc']).optional()
      ),
    })
  ),
});
