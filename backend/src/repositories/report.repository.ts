import { between, eq, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices_view, inventory_view, ledger_events, products } from '../db/schema';

export class ReportRepository {
  static async getSalesAggregation(startDate: Date, endDate: Date) {
    const [sales] = await db
      .select({
        grandTotal: sql<number>`COALESCE(SUM(${invoices_view.grandTotal}), 0)`.mapWith(Number),
        amountPaid: sql<number>`COALESCE(SUM(${invoices_view.amountPaid}), 0)`.mapWith(Number),
      })
      .from(invoices_view)
      .where(between(invoices_view.createdAt, startDate.getTime(), endDate.getTime()));

    return {
      grandTotal: sales?.grandTotal || 0,
      amountPaid: sales?.amountPaid || 0,
    };
  }

  static async getPaymentTotalsByMethod(startDate: Date, endDate: Date) {
    return await db
      .select({
        paymentMethod: sql<string>`(${ledger_events.payload}->>'paymentMethod')`,
        total: sql<number>`COALESCE(SUM((${ledger_events.payload}->>'amount')::numeric), 0)`.mapWith(Number),
      })
      .from(ledger_events)
      .where(
        sql`${ledger_events.type} = 'PAYMENT_RECEIVED' AND ${ledger_events.timestamp} BETWEEN ${startDate.getTime()} AND ${endDate.getTime()}`
      )
      .groupBy(sql`(${ledger_events.payload}->>'paymentMethod')`);
  }

  static async getProductsBelowStockThreshold(threshold: number) {
    return await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        totalStock: inventory_view.quantity,
      })
      .from(inventory_view)
      .innerJoin(products, eq(sql`(${inventory_view.productId})::bigint`, products.id))
      .where(sql`${inventory_view.quantity} <= ${threshold}`);
  }
}
