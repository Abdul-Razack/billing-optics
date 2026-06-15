import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

export const createLabJobSchema = z.object({
  body: z.object({
    jobTitle: z.string().trim().min(2).max(255),
    invoiceId: z.number().int().positive(),
    vendorId: z.number().int().positive().optional(),
    status: z.enum(['PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED']).optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
    expectedDate: z.string().optional(),
  })
});

export const updateLabJobSchema = z.object({
  body: z.object({
    jobTitle: z.string().trim().min(2).max(255).optional(),
    vendorId: z.number().int().positive().optional(),
    status: z.enum(['PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED']).optional(),
    notes: z.string().trim().max(1000).optional().or(z.literal('')),
    expectedDate: z.string().optional(),
    sentDate: z.string().optional(),
    receivedDate: z.string().optional(),
  })
});

export const getLabJobsSchema = z.object({
  query: paginationQuerySchema.extend({
    status: z.enum(['PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED']).optional(),
    vendorId: z.string().regex(/^\d+$/).transform(Number).optional(),
    invoiceId: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
