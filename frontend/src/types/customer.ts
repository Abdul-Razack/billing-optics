import { CustomField } from "./product";

export interface CustomerStats {
  totalPurchases: number;
  lastPurchaseDate?: string;
  totalSpent: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  stats: CustomerStats;
  customFields?: Record<string, any>;
}

// We can reuse CustomFieldType and CustomField from product.ts for customer custom fields.
export type CustomerCustomField = CustomField;
