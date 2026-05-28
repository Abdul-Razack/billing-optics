import { z } from 'zod';

// Reusable numeric coercion schemas
export const numericString = z.string().regex(/^\d+$/).transform(Number);

// Standard pagination schema
export const paginationQuerySchema = z.object({
  page: numericString.pipe(z.number().min(1)).optional().default(1 as any),
  limit: numericString.pipe(z.number().min(1).max(100)).optional().default(10 as any),
  search: z.string().trim().optional(),
});

// Standard date range schema
export const dateRangeQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
