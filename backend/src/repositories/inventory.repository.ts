import { eq, sum, desc, asc, and, ilike, gte, lte, sql } from 'drizzle-orm';
import { DbOrTx } from '../types/db';
import { inventoryLedger, products, users } from '../db/schema';

export interface InventoryHistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  createdBy?: number;
  sort?: 'newest' | 'oldest';
}

export class InventoryRepository {
  async getCurrentStock(productId: number, tx: DbOrTx): Promise<number> {
    const result = await tx
      .select({ stock: sum(inventoryLedger.quantityChange).mapWith(Number) })
      .from(inventoryLedger)
      .where(eq(inventoryLedger.productId, productId));
      
    return result[0]?.stock || 0;
  }

  async createLedgerEntries(data: (typeof inventoryLedger.$inferInsert)[], tx: DbOrTx) {
    if (data.length === 0) return [];
    return await tx.insert(inventoryLedger).values(data).returning();
  }

  async getHistory(query: InventoryHistoryQuery, tx: DbOrTx) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;
    
    const conditions = [];
    
    if (query.search) {
      const searchTerm = `%${query.search}%`;
      conditions.push(
        sql`(${products.name} ILIKE ${searchTerm} OR ${products.sku} ILIKE ${searchTerm} OR CAST(${inventoryLedger.referenceId} AS TEXT) ILIKE ${searchTerm})`
      );
    }
    
    if (query.movementType) {
      conditions.push(eq(inventoryLedger.movementType, query.movementType as any));
    }
    
    if (query.startDate) {
      conditions.push(gte(inventoryLedger.createdAt, new Date(query.startDate)));
    }
    
    if (query.endDate) {
      conditions.push(lte(inventoryLedger.createdAt, new Date(query.endDate)));
    }
    
    if (query.createdBy) {
      conditions.push(eq(inventoryLedger.createdBy, query.createdBy));
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const sortOrder = query.sort === 'oldest' ? asc(inventoryLedger.createdAt) : desc(inventoryLedger.createdAt);

    // Get total count
    const [countResult] = await tx
      .select({ count: sql<number>`count(*)` })
      .from(inventoryLedger)
      .leftJoin(products, eq(inventoryLedger.productId, products.id))
      .where(whereClause);
      
    const totalRecords = Number(countResult.count);
    const totalPages = Math.ceil(totalRecords / limit);

    // Get paginated data
    const records = await tx
      .select({
        id: inventoryLedger.id,
        productId: inventoryLedger.productId,
        movementType: inventoryLedger.movementType,
        quantityChange: inventoryLedger.quantityChange,
        referenceId: inventoryLedger.referenceId,
        notes: inventoryLedger.notes,
        createdAt: inventoryLedger.createdAt,
        createdBy: inventoryLedger.createdBy,
        product: {
          id: products.id,
          name: products.name,
          sku: products.sku,
        },
        creator: {
          id: users.id,
          fullName: users.fullName,
        }
      })
      .from(inventoryLedger)
      .leftJoin(products, eq(inventoryLedger.productId, products.id))
      .leftJoin(users, eq(inventoryLedger.createdBy, users.id))
      .where(whereClause)
      .orderBy(sortOrder)
      .limit(limit)
      .offset(offset);

    return {
      records,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: page,
        limit
      }
    };
  }
}
