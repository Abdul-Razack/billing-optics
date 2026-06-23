import { db } from '../config/db';
import { products, inventoryLedger } from '../db/schema';
import { eq, and, or, ilike, desc, sql, getTableColumns } from 'drizzle-orm';
import { generateSKU } from '../utils/barcode';
import { AppError } from '../utils/errors';
import { getPaginationParams, buildPaginatedResponse } from '../utils/pagination';

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
  attributes?: Record<string, any>;
  initialStock?: number;
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
  isDeleted?: boolean;
  sku?: string;
  barcode?: string;
  attributes?: Record<string, any>;
}

export class ProductService {
  async createProduct(data: CreateProductInput, userId?: number) {
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
          attributes: data.attributes || {},
        })
        .returning();

      if (data.initialStock && data.initialStock > 0) {
        await tx.insert(inventoryLedger).values({
          productId: newProduct.id,
          movementType: 'ADJUSTMENT',
          quantityChange: data.initialStock,
          notes: 'Initial stock on product creation',
          createdBy: userId || 1,
        });
      }

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
      .select({
        ...getTableColumns(products),
        stock: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.mapWith(Number)
      })
      .from(products)
      .leftJoin(inventoryLedger, eq(products.id, inventoryLedger.productId))
      .where(eq(products.id, id))
      .groupBy(products.id);

    if (!product) {
      throw new NotFoundError();
    }

    return product;
  }

  async getAllProducts(filters?: Record<string, any>) {
    const { page, limit, offset } = getPaginationParams(filters?.page, filters?.limit);
    
    let baseConditions: any = undefined;
    const conditionsArr: any[] = [eq(products.isDeleted, false)];

    if (filters?.categoryId) {
      conditionsArr.push(eq(products.categoryId, filters.categoryId));
    }
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      conditionsArr.push(
        or(
          ilike(products.name, searchTerm),
          sql`${products.sku} ILIKE ${searchTerm}`,
          sql`${products.barcode} ILIKE ${searchTerm}`
        )
      );
    }

    if (conditionsArr.length > 0) {
      baseConditions = and(...conditionsArr);
    }

    const [countResult, dataResult] = await Promise.all([
      db.select({ count: sql<number>`cast(count(*) as integer)` })
        .from(products)
        .where(baseConditions),
      db.select({
          ...getTableColumns(products),
          stock: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.mapWith(Number)
        })
        .from(products)
        .leftJoin(inventoryLedger, eq(products.id, inventoryLedger.productId))
        .where(baseConditions)
        .groupBy(products.id)
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset)
    ]);

    return buildPaginatedResponse(dataResult, countResult[0].count, page, limit);
  }
}

export const productService = new ProductService();
