import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

export const createVendorSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(255),
    contactPerson: z.string().trim().max(255).optional().or(z.literal('')),
    phone: z.string().trim().max(50).optional().or(z.literal('')),
    email: z.string().trim().email().optional().or(z.literal('')),
    address: z.string().trim().max(500).optional().or(z.literal('')),
  })
});

export const updateVendorSchema = z.object({
  body: createVendorSchema.shape.body.partial()
});

export const getVendorsSchema = z.object({
  query: paginationQuerySchema.extend({
    isActive: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      },
      z.boolean().optional()
    ),
  }),
});
