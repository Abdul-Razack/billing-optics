import { z } from 'zod';

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(['ADMIN', 'CASHIER', 'OPTOMETRIST']),
    isActive: z.boolean().optional().default(true),
    preferences: z.any().optional(),
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").optional(),
    email: z.string().email("Invalid email address").optional(),
    password: z.string().min(6, "Password must be at least 6 characters").optional(),
    role: z.enum(['ADMIN', 'CASHIER', 'OPTOMETRIST']).optional(),
    isActive: z.boolean().optional(),
    preferences: z.any().optional(),
  })
});

export const updateStatusSchema = z.object({
  body: z.object({
    isActive: z.boolean(),
  })
});
