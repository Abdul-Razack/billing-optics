import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(3).max(20),
    email: z.string().trim().email().optional().or(z.literal('')),
    address: z.string().trim().max(500).optional().or(z.literal('')),
  })
});

export const updateCustomerSchema = z.object({
  body: createCustomerSchema.shape.body.partial()
});

export const getCustomersSchema = z.object({
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

export const addPrescriptionSchema = z.object({
  body: z.object({
    rightEyeSph: z.number().min(-25).max(25),
    rightEyeCyl: z.number().min(-10).max(10),
    rightEyeAxis: z.number().int().min(0).max(180),
    leftEyeSph: z.number().min(-25).max(25),
    leftEyeCyl: z.number().min(-10).max(10),
    leftEyeAxis: z.number().int().min(0).max(180),
    pd: z.number().min(40).max(80),
    addPower: z.number().min(0.5).max(4.0).optional(),
  })
});
