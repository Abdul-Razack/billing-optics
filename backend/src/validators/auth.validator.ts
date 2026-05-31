import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(5),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email(),
    password: z.string().min(6).max(100),
    role: z.enum(['ADMIN', 'MANAGER', 'CASHIER', 'OPTOMETRIST']),
  }),
});
