import { eq, sql, and, gte, lte } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices, invoiceItems, payments, customers, products, inventoryLedger, categories } from '../db/schema';

export class ExportRepository {
  static async getSalesExport(startDate?: Date, endDate?: Date, status?: string) {
    const query = db
      .select({
        invoiceId: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        customerName: customers.fullName,
        customerPhone: customers.phone,
        paymentStatus: invoices.paymentStatus,
        subTotal: invoices.subtotal,
        taxTotal: invoices.taxTotal,
        discountTotal: invoices.discountTotal,
        grandTotal: invoices.grandTotal,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          startDate ? gte(invoices.createdAt, startDate) : undefined,
          endDate ? lte(invoices.createdAt, endDate) : undefined,
          status && status !== 'all' ? eq(invoices.paymentStatus, status as any) : undefined
        )
      )
      .orderBy(invoices.createdAt);

    return await query;
  }

  static async getInventoryExport(categoryId?: number) {
    const stockSubquery = db
      .select({
        productId: inventoryLedger.productId,
        currentStock: sql<number>`COALESCE(SUM(${inventoryLedger.quantityChange}), 0)`.as('currentStock')
      })
      .from(inventoryLedger)
      .groupBy(inventoryLedger.productId)
      .as('stock');

    const query = db
      .select({
        productId: products.id,
        sku: products.sku,
        name: products.name,
        category: categories.name,
        costPrice: products.costPrice,
        sellingPrice: products.sellingPrice,
        minStockAlert: products.minStockAlert,
        currentStock: sql<number>`COALESCE(${stockSubquery.currentStock}, 0)`.mapWith(Number),
        isActive: products.isActive,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(stockSubquery, eq(products.id, stockSubquery.productId))
      .where(
        categoryId ? eq(products.categoryId, categoryId) : undefined
      )
      .orderBy(products.name);

    return await query;
  }

  static async getCustomersExport(startDate?: Date, endDate?: Date, status?: string) {
    const query = db
      .select({
        customerId: customers.id,
        fullName: customers.fullName,
        email: customers.email,
        phone: customers.phone,
        address: customers.address,
        totalOrders: sql<number>`COUNT(${invoices.id})`.mapWith(Number),
        totalSpent: sql<number>`COALESCE(SUM(${invoices.grandTotal}), 0)`.mapWith(Number),
        createdAt: customers.createdAt,
      })
      .from(customers)
      .leftJoin(invoices, eq(customers.id, invoices.customerId))
      .where(
        and(
          startDate ? gte(customers.createdAt, startDate) : undefined,
          endDate ? lte(customers.createdAt, endDate) : undefined
        )
      )
      .groupBy(customers.id)
      .orderBy(customers.createdAt);

    return await query;
  }

  static async getPaymentsExport(startDate?: Date, endDate?: Date, method?: string) {
    const query = db
      .select({
        paymentId: payments.id,
        invoiceNumber: invoices.invoiceNumber,
        customerName: customers.fullName,
        amount: payments.amount,
        paymentMethod: payments.paymentMethod,
        referenceNumber: payments.referenceNumber,
        notes: payments.notes,
        paymentDate: payments.createdAt,
      })
      .from(payments)
      .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          startDate ? gte(payments.createdAt, startDate) : undefined,
          endDate ? lte(payments.createdAt, endDate) : undefined,
          method && method !== 'all' ? eq(payments.paymentMethod, method as any) : undefined
        )
      )
      .orderBy(payments.createdAt);

    return await query;
  }
}
