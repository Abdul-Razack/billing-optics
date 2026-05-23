import { z } from 'zod';

// Base entity ID schemas
export const idSchema = z.string().uuid();

// Shared Zod Schemas for Validation
export const baseUserSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string(),
  isActive: z.boolean().default(true),
});

export const baseCustomerSchema = z.object({
  id: idSchema.optional(),
  name: z.string().min(2),
  phone: z.string().min(10),
  email: z.string().email().optional().nullable(),
});
