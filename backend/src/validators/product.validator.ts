import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    name: z.string().min(2),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    costPrice: z.number().positive(),
    sellingPrice: z.number().positive(),
    taxRate: z.number().default(18),
    stockQuantity: z.number().int().nonnegative().default(0),
  }),
});
