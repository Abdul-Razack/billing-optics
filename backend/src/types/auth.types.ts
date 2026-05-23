import { z } from 'zod';
import { loginSchema, registerSchema } from '../validators/auth.validator';

export type LoginPayload = z.infer<typeof loginSchema>['body'];
export type RegisterPayload = z.infer<typeof registerSchema>['body'];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}
