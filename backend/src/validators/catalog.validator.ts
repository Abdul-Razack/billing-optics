import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(255),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.number().int().positive(),
    name: z.string().trim().min(1).max(255),
    sku: z.string().trim().max(100).optional(),
    barcode: z.string().trim().max(100).optional(),
    description: z.string().trim().max(1000).optional(),
    costPrice: z.number().nonnegative().max(10000000),
    sellingPrice: z.number().nonnegative().max(10000000),
    gstPercent: z.number().int().nonnegative().max(100).optional(),
    minStockAlert: z.number().int().nonnegative().max(10000).optional(),
    isActive: z.boolean().optional(),
    attributes: z.record(z.any()).optional(),
  })
});

export const updateProductSchema = z.object({
  body: createProductSchema.shape.body.partial()
});
