import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
});

export const createProductSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(1),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  description: z.string().optional(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  gstPercent: z.number().int().nonnegative().max(100).optional(),
  minStockAlert: z.number().int().nonnegative().optional(),
});

export const updateProductSchema = createProductSchema.partial();
