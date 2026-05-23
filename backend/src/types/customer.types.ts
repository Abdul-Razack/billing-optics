import { z } from 'zod';
import { createCustomerSchema } from '../validators/customer.validator';

export type CreateCustomerPayload = z.infer<typeof createCustomerSchema>['body'];

export interface CustomerDetails {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  createdAt: Date;
}
