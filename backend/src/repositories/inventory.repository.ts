import { eq, sum } from 'drizzle-orm';
import { DbOrTx } from '../types/db';
import { inventoryLedger } from '../db/schema';

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
}
