import { z } from 'zod';
import { createProductSchema } from '../validators/catalog.validator';

export type CreateProductPayload = z.infer<typeof createProductSchema>;

export interface ProductDetails {
  id: string;
  categoryId: string;
  sku?: string | null;
  barcode?: string | null;
  name: string;
  brand?: string | null;
  model?: string | null;
  costPrice: string;
  sellingPrice: string;
  taxRate: string;
  stockQuantity: number;
  minStockAlert: number;
}
