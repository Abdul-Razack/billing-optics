export interface ApiCustomer {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  gender: string | null;
  address: string | null;
  notes: string | null;
  customFields: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerCustomField {
  id: string;
  name: string;
  type: "text" | "number" | "dropdown" | "checkbox" | "textarea";
  options?: string[];
  required?: boolean;
}

export interface Customer {
  id: string | number;
  fullName: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  stats?: {
    totalPurchases: number;
    lastPurchaseDate?: string;
    totalSpent: number;
  };
  customFields?: Record<string, any>;
}
