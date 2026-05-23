import { db } from '../config/db';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateSKU } from '../utils/barcode';
import { AppError } from '../utils/errors';

export class NotFoundError extends AppError {
  constructor(message = 'Product not found') {
    super(404, message);
  }
}

export interface CreateProductInput {
  categoryId: number;
  name: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  gstPercent?: number;
  minStockAlert?: number;
  sku?: string;
  barcode?: string;
}

export interface UpdateProductInput {
  categoryId?: number;
  name?: string;
  description?: string;
  costPrice?: number;
  sellingPrice?: number;
  gstPercent?: number;
  minStockAlert?: number;
  isActive?: boolean;
}

export class ProductService {
  async createProduct(data: CreateProductInput) {
    return await db.transaction(async (tx) => {
      const brandStr = data.name.split(' ')[0] || 'GEN';
      const modelStr = data.name.split(' ')[1] || 'MOD';
      
      const generatedCode = generateSKU(brandStr, modelStr, data.categoryId.toString());
      const sku = data.sku || generatedCode;
      const barcode = data.barcode || generatedCode;

      const [newProduct] = await tx
        .insert(products)
        .values({
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          costPrice: data.costPrice,
          sellingPrice: data.sellingPrice,
          gstPercent: data.gstPercent,
          minStockAlert: data.minStockAlert,
          sku,
          barcode,
        })
        .returning();

      return newProduct;
    });
  }

  async updateProduct(id: number, data: UpdateProductInput) {
    return await db.transaction(async (tx) => {
      const [existing] = await tx
        .select()
        .from(products)
        .where(eq(products.id, id));

      if (!existing) {
        throw new NotFoundError();
      }

      const [updated] = await tx
        .update(products)
        .set({
          ...data,
          updatedAt: new Date()
        })
        .where(eq(products.id, id))
        .returning();

      return updated;
    });
  }

  async getProductById(id: number) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      throw new NotFoundError();
    }

    return product;
  }

  async getAllProducts(filters?: Record<string, any>) {
    return await db
      .select()
      .from(products);
  }
}

export const productService = new ProductService();
