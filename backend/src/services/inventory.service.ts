import { InventoryRepository, InventoryHistoryQuery } from '../repositories/inventory.repository';
import { db } from '../config/db';
import { eq } from 'drizzle-orm';
import { products } from '../db/schema';

export class InventoryService {
  private repository: InventoryRepository;
  
  constructor() {
    this.repository = new InventoryRepository();
  }

  async adjustStock(
    payload: {
      productId: number;
      adjustmentType: 'IN' | 'OUT' | 'ADJUSTMENT';
      quantity: number;
      notes?: string;
      referenceId?: number;
    },
    userId: number
  ) {
    if (payload.quantity === 0) {
      throw new Error('Quantity must be non-zero.');
    }

    let quantityChange = payload.quantity;
    if (payload.adjustmentType === 'OUT' && quantityChange > 0) {
      quantityChange = -quantityChange; // ensure OUT is negative
    } else if (payload.adjustmentType === 'IN' && quantityChange < 0) {
      quantityChange = Math.abs(quantityChange); // ensure IN is positive
    }

    let movementType: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' = 'ADJUSTMENT';
    if (payload.adjustmentType === 'IN') movementType = 'PURCHASE'; // Or RETURN, but PURCHASE works as generic IN
    if (payload.adjustmentType === 'OUT') movementType = 'SALE';

    return await db.transaction(async (tx) => {
      // 1. Verify product exists
      const product = await tx.query.products.findFirst({
        where: eq(products.id, payload.productId)
      });

      if (!product) {
        throw new Error('Product not found.');
      }

      // 2. Calculate current stock
      const currentStock = await this.repository.getCurrentStock(payload.productId, tx);
      const newStock = currentStock + quantityChange;

      // 3. Prevent negative stock
      if (newStock < 0) {
        throw new Error('Insufficient stock. Adjustment would result in negative stock.');
      }

      // 4. Create ledger entry
      const entries = await this.repository.createLedgerEntries([{
        productId: payload.productId,
        movementType,
        quantityChange,
        notes: payload.notes || null,
        referenceId: payload.referenceId || null,
        createdBy: userId
      }], tx);

      return {
        entry: entries[0],
        newStock
      };
    });
  }

  async getHistory(query: InventoryHistoryQuery) {
    return await this.repository.getHistory(query, db);
  }

  async bulkAdjustStock(
    payload: {
      adjustments: {
        productId: number;
        adjustmentType: 'IN' | 'OUT' | 'ADJUSTMENT';
        quantity: number;
        notes?: string;
        referenceId?: number;
      }[];
    },
    userId: number
  ) {
    if (payload.adjustments.length === 0) {
      throw new Error('At least one adjustment is required.');
    }

    return await db.transaction(async (tx) => {
      // 1. Get all product IDs and fetch them
      const productIds = payload.adjustments.map(a => a.productId);
      const uniqueProductIds = [...new Set(productIds)];
      
      // Bulk fetch products
      const dbProducts = await tx.query.products.findMany({
        where: (products, { inArray }) => inArray(products.id, uniqueProductIds)
      });
      
      const productMap = new Map(dbProducts.map(p => [p.id, p]));
      
      // 2. Validate all products exist
      for (const id of uniqueProductIds) {
        if (!productMap.has(id)) {
          throw new Error(`Product with ID ${id} not found.`);
        }
      }

      // 3. Process each adjustment
      const ledgerEntriesToInsert: any[] = [];
      const updatedStockSummary: Record<number, number> = {};
      
      // Get current stock for all involved products to calculate sequentially
      const currentStocks = new Map<number, number>();
      for (const id of uniqueProductIds) {
        currentStocks.set(id, await this.repository.getCurrentStock(id, tx));
      }

      for (const adjustment of payload.adjustments) {
        if (adjustment.quantity === 0) {
          throw new Error(`Quantity must be non-zero for product ID ${adjustment.productId}.`);
        }

        let quantityChange = adjustment.quantity;
        if (adjustment.adjustmentType === 'OUT' && quantityChange > 0) {
          quantityChange = -quantityChange;
        } else if (adjustment.adjustmentType === 'IN' && quantityChange < 0) {
          quantityChange = Math.abs(quantityChange);
        }

        let movementType: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' = 'ADJUSTMENT';
        if (adjustment.adjustmentType === 'IN') movementType = 'PURCHASE';
        if (adjustment.adjustmentType === 'OUT') movementType = 'SALE';

        const currentStock = currentStocks.get(adjustment.productId) || 0;
        const newStock = currentStock + quantityChange;

        if (newStock < 0) {
          throw new Error(`Insufficient stock for product ID ${adjustment.productId}. Adjustment would result in negative stock.`);
        }

        // Update running stock for subsequent adjustments of the same product
        currentStocks.set(adjustment.productId, newStock);
        updatedStockSummary[adjustment.productId] = newStock;

        ledgerEntriesToInsert.push({
          productId: adjustment.productId,
          movementType,
          quantityChange,
          notes: adjustment.notes || null,
          referenceId: adjustment.referenceId || null,
          createdBy: userId
        });
      }

      // 4. Bulk insert ledger entries
      const entries = await this.repository.createLedgerEntries(ledgerEntriesToInsert, tx);

      return {
        successCount: entries.length,
        failedCount: 0,
        entries,
        updatedStockSummary
      };
    });
  }
}

export const inventoryService = new InventoryService();
