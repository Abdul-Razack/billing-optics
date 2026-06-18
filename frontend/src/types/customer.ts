import { Prescription } from "./prescription";

export interface ApiCustomer {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  gender: string | null;
  address: string | null;
  notes: string | null;
  customFields: Record<string, any>;
  dateOfBirth?: string | null;
  anniversaryDate?: string | null;
  isDnd: boolean;
  labels: string[];
  loyaltyPoints: number;
  referredBy?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  prescriptionCount?: number;
  latestPrescription?: Prescription | null;
  prescriptionHistory?: any[];
  invoices?: any[];
}

export interface CustomField {
  id: string;
  name: string;
  type: "TEXT" | "number" | "dropdown" | "checkbox" | "textarea";
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
