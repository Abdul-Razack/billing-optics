import { eq, desc } from 'drizzle-orm';
import { DbOrTx } from '../types/db';
import { invoices, invoiceItems } from '../db/schema';

export class InvoiceRepository {
  async findInvoiceByRequestId(requestId: string, tx: DbOrTx) {
    if (!requestId) return null;
    const result = await tx.select().from(invoices).where(eq(invoices.requestId, requestId)).limit(1);
    return result[0] || null;
  }

  async createInvoice(data: typeof invoices.$inferInsert, tx: DbOrTx) {
    const result = await tx.insert(invoices).values(data).returning();
    return result[0];
  }

  async createInvoiceItems(data: (typeof invoiceItems.$inferInsert)[], tx: DbOrTx) {
    if (data.length === 0) return [];
    return await tx.insert(invoiceItems).values(data).returning();
  }

  async findInvoicesByCustomerId(customerId: number, tx: DbOrTx) {
    return await tx
      .select()
      .from(invoices)
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));
  }
}
