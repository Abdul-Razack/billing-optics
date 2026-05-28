import { eq, sql, ilike, or, and, desc, asc } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices } from '../db/schema/invoices';
import { invoiceItems } from '../db/schema/invoiceItems';
import { customers } from '../db/schema/customers';
import { payments } from '../db/schema/payments';
import { DbOrTx } from '../types/db';

export class BillingRepository {
  static async getInvoices(params: any) {
    const { page = 1, limit = 10, search, status, paymentStatus, sortBy, sortDirection } = params;
    
    // Base conditions
    const conditions = [];
    if (paymentStatus && paymentStatus !== 'all') {
      conditions.push(eq(invoices.paymentStatus, paymentStatus));
    }
    
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, searchTerm),
          ilike(customers.name, searchTerm),
          ilike(customers.phone, searchTerm)
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const offset = (page - 1) * limit;
    
    // Sort logic
    let orderBy: any = desc(invoices.createdAt);
    if (sortBy === 'amount') {
      orderBy = sortDirection === 'asc' ? asc(invoices.grandTotal) : desc(invoices.grandTotal);
    } else if (sortBy === 'date') {
      orderBy = sortDirection === 'asc' ? asc(invoices.createdAt) : desc(invoices.createdAt);
    } else if (sortBy === 'customer') {
      orderBy = sortDirection === 'asc' ? asc(customers.name) : desc(customers.name);
    }

    const itemCountsSq = db.select({
      invoiceId: invoiceItems.invoiceId,
      itemCount: sql<number>`count(${invoiceItems.id})::int`.as('itemCount')
    })
    .from(invoiceItems)
    .groupBy(invoiceItems.invoiceId)
    .as('item_counts');

    // Execute query
    const results = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerId: invoices.customerId,
      customerName: customers.name,
      createdBy: invoices.createdBy,
      subtotal: invoices.subtotal,
      taxTotal: invoices.taxTotal,
      discountTotal: invoices.discountTotal,
      grandTotal: invoices.grandTotal,
      amountPaid: invoices.amountPaid,
      paymentStatus: invoices.paymentStatus,
      status: sql<string>`'COMPLETED'`.as('status'),
      itemCount: sql<number>`COALESCE(${itemCountsSq.itemCount}, 0)`.as('itemCount'),
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(itemCountsSq, eq(invoices.id, itemCountsSq.invoiceId))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

    // Get total count
    const [countResult] = await db.select({
      total: sql<number>`count(*)::int`
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(whereClause);

    return {
      data: results.map(r => ({ ...r, customerName: r.customerName || 'Walk-in Customer' })),
      total: countResult.total || 0
    };
  }
