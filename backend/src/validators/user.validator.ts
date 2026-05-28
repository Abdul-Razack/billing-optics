import { z } from 'zod';
import { paginationQuerySchema } from './common.validator';

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").max(100),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'OPTOMETRIST']),
    isActive: z.boolean().optional().default(true),
    preferences: z.any().optional(),
  })
});

export const updateUserSchema = z.object({
  body: createUserSchema.shape.body.partial().omit({ password: true }).extend({
    password: z.string().min(6).max(100).optional(),
  })
});

export const updateStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  })
});

export const getUsersSchema = z.object({
  query: paginationQuerySchema.merge(
    z.object({
      role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'OPTOMETRIST']).optional(),
    }).partial()
  )
});
