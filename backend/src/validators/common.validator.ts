import { z } from 'zod';

// Reusable numeric coercion schemas
export const numericString = z.string().regex(/^\d+$/).transform(Number);

const createNumericQueryParam = (min: number, max: number | undefined, def: number) => {
  let schema = z.coerce.number().min(min);
  if (max !== undefined) {
    schema = schema.max(max);
  }
  return z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    schema.optional().catch(def).default(def)
  );
};

// Standard pagination schema
export const paginationQuerySchema = z.object({
  page: createNumericQueryParam(1, undefined, 1),
  limit: createNumericQueryParam(1, 100, 10),
  search: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().optional()
  ),
  sortBy: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().trim().optional()
  ),
  sortOrder: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.enum(['asc', 'desc']).optional()
  ),
  filters: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return undefined;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return undefined; }
      }
      return val;
    },
    z.record(z.any()).optional().catch(undefined)
  )
});

// Standard date range schema
export const dateRangeQuerySchema = z.object({
  startDate: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().datetime().optional()
  ),
  endDate: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? undefined : val),
    z.string().datetime().optional()
  ),
});
