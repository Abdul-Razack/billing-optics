export type CustomFieldType = "text" | "number" | "dropdown" | "checkbox" | "textarea";

export interface CustomField {
  id: string;
  name: string;
  type: CustomFieldType;
  options?: string[]; // For dropdown type
  required: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  gstPercent: number;
  minStockAlert: number;
  currentStock: number;
  isActive: boolean;
  stockStatus: StockStatus;
  customFields?: Record<string, any>;
}
