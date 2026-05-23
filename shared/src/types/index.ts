import { z } from 'zod';
import { baseUserSchema, baseCustomerSchema } from '../schemas';

// Inferred TypeScript Types from Shared Schemas
export type User = z.infer<typeof baseUserSchema>;
export type Customer = z.infer<typeof baseCustomerSchema>;
export type GSTPercentage = 0 | 5 | 12 | 18 | 28;
export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'NET_BANKING' | 'MIXED';
export type InvoiceStatus = 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'CANCELLED';
export type InventoryTransactionType = 'STOCK_IN' | 'STOCK_OUT' | 'RETURN' | 'ADJUSTMENT';
