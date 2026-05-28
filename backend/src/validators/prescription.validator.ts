import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

const eyeMeasurementSchema = z.object({
  sphere: z.string().trim().max(10).optional().nullable(),
  cylinder: z.string().trim().max(10).optional().nullable(),
  axis: z.string().trim().max(10).optional().nullable(),
  addPower: z.string().trim().max(10).optional().nullable(),
});

const prescriptionBase = {
  customerId: z.union([z.string(), z.number()]).transform(v => Number(v)),
  rightEye: eyeMeasurementSchema.optional(),
  leftEye: eyeMeasurementSchema.optional(),
  pd: z.string().trim().max(10).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
};

export const createPrescriptionSchema = z.object({
  body: z.object(prescriptionBase),
});

export const updatePrescriptionSchema = z.object({
  body: z.object(prescriptionBase).partial(),
});

export const getPrescriptionsSchema = z.object({
  query: paginationQuerySchema.merge(
    z.object({
      sortBy: z.enum(['newest', 'oldest']).optional(),
    }).partial()
  )
});
