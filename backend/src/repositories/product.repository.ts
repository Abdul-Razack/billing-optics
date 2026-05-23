import { inArray } from 'drizzle-orm';
import { DbOrTx } from '../types/db';
import { products } from '../db/schema';

export class ProductRepository {
  async getProductsForUpdate(ids: number[], tx: DbOrTx) {
    if (ids.length === 0) return [];
    
    // Sort IDs to prevent deadlocks during concurrent checkout locking
    const sortedIds = [...new Set(ids)].sort((a, b) => a - b);
    
    // Acquire row-level lock FOR UPDATE
    return await tx
      .select()
      .from(products)
      .where(inArray(products.id, sortedIds))
      .for('update');
  }
}
