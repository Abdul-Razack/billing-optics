import { db } from '../config/db';
import { salesReturns, salesReturnItems, invoices, inventoryLedger, products } from '../db/schema';
import { eq, desc, getTableColumns } from 'drizzle-orm';
import { AppError } from '../utils/errors';

export class SalesReturnService {
  async processReturn(data: {
    invoiceId: number;
    customerId: number;
    processedBy: number;
    reason?: string;
    items: {
      invoiceItemId: number;
      productId: number;
      quantityReturned: number;
      refundAmount: number;
    }[];
  }) {
    return await db.transaction(async (tx) => {
      // 1. Verify invoice exists
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, data.invoiceId));
      if (!invoice) throw new AppError(404, 'Invoice not found');

      const returnNumber = `RET-${Date.now()}`;
      const totalRefundAmount = data.items.reduce((sum, item) => sum + item.refundAmount, 0);

      // 2. Create Sales Return
      const [newReturn] = await tx.insert(salesReturns).values({
        returnNumber,
        invoiceId: data.invoiceId,
        customerId: data.customerId,
        processedBy: data.processedBy,
        totalRefundAmount,
        reason: data.reason,
        status: 'COMPLETED' // For now, assume it's immediately completed
      }).returning();

      // 3. Process items and inventory
      for (const item of data.items) {
        if (item.quantityReturned <= 0) continue;

        // Insert return item
        await tx.insert(salesReturnItems).values({
          returnId: newReturn.id,
          invoiceItemId: item.invoiceItemId,
          productId: item.productId,
          quantityReturned: item.quantityReturned,
          refundAmount: item.refundAmount
        });

        // Add to inventory ledger (quantity goes UP)
        await tx.insert(inventoryLedger).values({
          referenceId: newReturn.id,
          referenceType: 'RETURN',
          productId: item.productId,
          movementType: 'RETURN',
          quantityChange: item.quantityReturned,
          unitCost: 0 // Will default to 0 for returns since cost is tricky here
        });
      }

      // Update invoice amountPaid to reflect refund? 
      // If needed, but usually we just track total sales returns separately.
      
      return newReturn;
    });
  }

  async getAllReturns() {
    const data = await db.select().from(salesReturns).orderBy(desc(salesReturns.createdAt));
    return { data, meta: { total: data.length } };
  }
}

export const salesReturnService = new SalesReturnService();
