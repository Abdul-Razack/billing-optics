import { z } from 'zod';
import { paginationQuerySchema, dateRangeQuerySchema } from './common.validator';

export const getPaymentsSchema = z.object({
  query: paginationQuerySchema.merge(dateRangeQuerySchema).merge(
    z.object({
      method: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).optional()
      ),
      sortBy: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['newest', 'oldest', 'highest']).optional()
      ),
      customerId: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.coerce.number().min(1).optional()
      ),
      invoiceId: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.coerce.number().min(1).optional()
      ),
    })
  )
});
