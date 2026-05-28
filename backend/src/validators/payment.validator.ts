import { z } from 'zod';
import { paginationQuerySchema, dateRangeQuerySchema } from './common.validator';

export const getPaymentsSchema = z.object({
  query: paginationQuerySchema.merge(dateRangeQuerySchema).merge(
    z.object({
      method: z.enum(['CASH', 'CARD', 'UPI', 'BANK_TRANSFER']).optional(),
      sortBy: z.enum(['newest', 'oldest', 'highest']).optional(),
    }).partial()
  )
});
