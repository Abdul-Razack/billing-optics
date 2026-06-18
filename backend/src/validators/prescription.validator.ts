import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

const eyeMeasurementSchema = z.object({
  sph: z.string().trim().max(10).optional().nullable(),
  cyl: z.string().trim().max(10).optional().nullable(),
  axis: z.union([z.string(), z.number()]).transform(v => v ? parseInt(String(v), 10) : null).optional().nullable(),
  va: z.string().trim().max(20).optional().nullable(),
});

const prescriptionTestSchema = z.object({
  testType: z.enum(['OLD_LENS', 'AR_READING', 'MANUAL_TESTING', 'SPECTACLE']),
  
  rightEyeDv: eyeMeasurementSchema.optional(),
  rightEyeNv: eyeMeasurementSchema.optional(),
  rightEyeAdd: z.string().trim().max(10).optional().nullable(),
  rightEyePd: z.string().trim().max(10).optional().nullable(),

  leftEyeDv: eyeMeasurementSchema.optional(),
  leftEyeNv: eyeMeasurementSchema.optional(),
  leftEyeAdd: z.string().trim().max(10).optional().nullable(),
  leftEyePd: z.string().trim().max(10).optional().nullable(),
});

const prescriptionBase = {
  customerId: z.union([z.string(), z.number()]).transform(v => Number(v)).optional(),
  patientId: z.union([z.string(), z.number()]).transform(v => Number(v)).optional(),
  doctorId: z.union([z.string(), z.number()]).transform(v => Number(v)).optional().nullable(),
  
  prescriptionType: z.enum(['EYEWEAR', 'CONTACT_LENS']).default('EYEWEAR'),
  cardDescription: z.string().trim().max(255).optional().nullable(),
  countInRecords: z.boolean().default(true),

  lensTypes: z.array(z.string()).optional(),
  notes: z.string().trim().max(1000).optional().nullable(),

  tests: z.array(prescriptionTestSchema).optional().default([]),
};

export const createPrescriptionSchema = z.object({
  body: z.object(prescriptionBase),
});

export const updatePrescriptionSchema = z.object({
  body: z.object({
    ...prescriptionBase,
    tests: z.array(prescriptionTestSchema).optional() // tests can be updated completely by providing a new array
  }).partial(),
});

export const getPrescriptionsSchema = z.object({
  query: paginationQuerySchema.merge(
    z.object({
      sortBy: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.enum(['newest', 'oldest']).optional()
      ),
      customerId: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.coerce.number().min(1).optional()
      ),
      patientId: z.preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : val),
        z.coerce.number().min(1).optional()
      ),
    })
  )
});
