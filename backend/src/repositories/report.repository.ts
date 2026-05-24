import { between, eq, sql } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices } from '../db/schema/invoices';
import { payments } from '../db/schema/payments';
import { inventoryLedger } from '../db/schema/inventoryLedger';
import { products } from '../db/schema/products';

export class ReportRepository {
  static async getSalesAggregation(startDate: Date, endDate: Date) {
    const [sales] = await db
      .select({
        grandTotal: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.mapWith(Number),
      })
      .from(invoices)
      .where(between(invoices.createdAt, startDate, endDate));

    const [paid] = await db
      .select({
        amountPaid: sql<number>`COALESCE(SUM(${payments.amount}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(between(payments.createdAt, startDate, endDate));

    return {
      grandTotal: sales?.grandTotal || 0,
      amountPaid: paid?.amountPaid || 0,
    };
  }

  static async getPaymentTotalsByMethod(startDate: Date, endDate: Date) {
    return await db
      .select({
        paymentMethod: payments.paymentMethod,
        total: sql<number>`COALESCE(SUM(${payments.amount}), 0)`.mapWith(Number),
      })
      .from(payments)
      .where(between(payments.createdAt, startDate, endDate))
      .groupBy(payments.paymentMethod);
  }

  static async getProductsBelowStockThreshold(threshold: number) {
    return await db
      .select({
        productId: products.id,
        name: products.name,
        sku: products.sku,
        totalStock: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.mapWith(Number),
      })
      .from(inventoryLedger)
      .innerJoin(products, eq(inventoryLedger.productId, products.id))
      .groupBy(products.id, products.name, products.sku)
      .having(sql`COALESCE(SUM(${inventoryLedger.quantityChange}), 0) <= ${threshold}`);
  }
}
