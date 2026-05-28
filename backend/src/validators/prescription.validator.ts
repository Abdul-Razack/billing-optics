import { z } from 'zod';

const eyeMeasurementSchema = z.object({
  sphere: z.string().optional().nullable(),
  cylinder: z.string().optional().nullable(),
  axis: z.string().optional().nullable(),
  addPower: z.string().optional().nullable(),
});

const prescriptionBase = {
  customerId: z.union([z.string(), z.number()]).transform(v => Number(v)),
  rightEye: eyeMeasurementSchema.optional(),
  leftEye: eyeMeasurementSchema.optional(),
  pd: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
};

export const createPrescriptionSchema = z.object({
  body: z.object(prescriptionBase),
});

export const updatePrescriptionSchema = z.object({
  body: z.object(prescriptionBase).partial(),
});

export const getPrescriptionsSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    sortBy: z.enum(['newest', 'oldest']).optional(),
  }),
});
