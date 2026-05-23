import { z } from 'zod';
import { createProductSchema } from '../validators/product.validator';

export type CreateProductPayload = z.infer<typeof createProductSchema>['body'];

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
