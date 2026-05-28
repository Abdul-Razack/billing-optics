import { z } from 'zod';

export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.number().int().positive(),
    adjustmentType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: z.number().int(),
    notes: z.string().optional(),
    referenceId: z.number().int().positive().optional(),
  })
});

export const bulkAdjustStockSchema = z.object({
  body: z.object({
    adjustments: z.array(
      z.object({
        productId: z.number().int().positive(),
        adjustmentType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
        quantity: z.number().int(),
        notes: z.string().optional(),
        referenceId: z.number().int().positive().optional(),
      })
    ).min(1, "At least one adjustment is required")
  })
});
