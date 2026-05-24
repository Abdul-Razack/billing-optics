import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1),
});

export const createProductSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export const updateProductSchema = createProductSchema.partial();
