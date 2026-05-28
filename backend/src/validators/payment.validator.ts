import { z } from 'zod';

export const getPaymentsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    method: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['newest', 'oldest', 'highest']).optional(),
  }),
});
