import { z } from 'zod';

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().email().optional(),
    address: z.string().optional(),
  }),
});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
  }),
});

export const addPrescriptionSchema = z.object({
  body: z.object({
    rightEyeSph: z.number(),
    rightEyeCyl: z.number(),
    rightEyeAxis: z.number(),
    leftEyeSph: z.number(),
    leftEyeCyl: z.number(),
    leftEyeAxis: z.number(),
    pd: z.number(),
    addPower: z.number().optional(),
  }),
});
