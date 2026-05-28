import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

export const adjustStockSchema = z.object({
  body: z.object({
    productId: z.number().int().positive(),
    adjustmentType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
    quantity: z.number().int().max(100000).min(-100000),
    notes: z.string().trim().max(1000).optional(),
    referenceId: z.number().int().positive().optional(),
  })
});

export const bulkAdjustStockSchema = z.object({
  body: z.object({
    adjustments: z.array(
      z.object({
        productId: z.number().int().positive(),
        adjustmentType: z.enum(['IN', 'OUT', 'ADJUSTMENT']),
        quantity: z.number().int().max(100000).min(-100000),
        notes: z.string().trim().max(1000).optional(),
        referenceId: z.number().int().positive().optional(),
      })
    ).min(1, "At least one adjustment is required").max(1000, "Too many adjustments")
  })
});

export const getInventoryHistorySchema = z.object({
  query: paginationQuerySchema.merge(
    z.object({
      type: z.enum(['IN', 'OUT', 'ADJUSTMENT']).optional(),
      productId: z.string().regex(/^\d+$/).transform(Number).optional(),
    }).partial()
  )
});
