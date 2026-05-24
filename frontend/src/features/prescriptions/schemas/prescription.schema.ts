import { z } from 'zod';

export const eyeSchema = z.object({
  sphere: z.number().min(-20).max(20),
  cylinder: z.number().min(-10).max(10),
  axis: z.number().min(0).max(180),
  add: z.number().min(0).max(4).optional(),
  pd: z.number().positive(),
});

export const prescriptionSchema = z.object({
  rightEye: eyeSchema,
  leftEye: eyeSchema,
  notes: z.string().optional(),
  doctorName: z.string().min(1, "Doctor name is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
});

export type PrescriptionFormValues = z.infer<typeof prescriptionSchema>;
