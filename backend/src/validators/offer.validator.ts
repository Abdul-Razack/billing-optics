import { z } from 'zod';

export const createOfferSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().max(50).optional().nullable(),
  type: z.enum(['PERCENTAGE', 'FLAT_AMOUNT']),
  value: z.number().int().positive(),
  minOrderValue: z.number().int().min(0).optional().default(0),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  applicableProducts: z.array(z.number()).optional().nullable(),
  applicableCategories: z.array(z.number()).optional().nullable(),
  conditions: z.any().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const updateOfferSchema = createOfferSchema.partial();

export const validateOfferSchema = z.object({
  offerId: z.number().int().positive(),
  cartTotal: z.number().int().nonnegative(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    categoryId: z.number().int().positive().optional(),
    quantity: z.number().int().positive(),
    price: z.number().int().nonnegative(),
  })).optional(),
});
