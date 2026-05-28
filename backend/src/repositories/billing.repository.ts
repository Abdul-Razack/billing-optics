import { eq, sql, ilike, or, and, desc, asc } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices } from '../db/schema/invoices';
import { customers } from '../db/schema/customers';
import { invoiceItems } from '../db/schema/invoiceItems';
import { payments } from '../db/schema/payments';
import { users } from '../db/schema/users';
import { DbOrTx } from '../types/db';

export class BillingRepository {
  static async getInvoices(params: any) {
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = params.limit ? parseInt(params.limit, 10) : 10;
    const { search, status, paymentStatus, sortBy, sortDirection } = params;

    const conditions = [];
    if (paymentStatus && paymentStatus !== 'all') {
      conditions.push(eq(invoices.paymentStatus, paymentStatus));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, searchTerm),
          ilike(customers.fullName, searchTerm),
          ilike(customers.phone, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    let orderBy: any = desc(invoices.createdAt);
    if (sortBy === 'amount') {
      orderBy = sortDirection === 'asc' ? asc(invoices.grandTotal) : desc(invoices.grandTotal);
    } else if (sortBy === 'date') {
      orderBy = sortDirection === 'asc' ? asc(invoices.createdAt) : desc(invoices.createdAt);
    } else if (sortBy === 'customer') {
      orderBy = sortDirection === 'asc' ? asc(customers.fullName) : desc(customers.fullName);
    }

    const itemCountsSq = db.select({
      invoiceId: invoiceItems.invoiceId,
      itemCount: sql<number>`count(${invoiceItems.id})::int`.as('itemCount')
    })
    .from(invoiceItems)
    .groupBy(invoiceItems.invoiceId)
    .as('item_counts');

    const results = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      customerId: invoices.customerId,
      customerName: customers.fullName,
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

    const [countResult] = await db.select({
      total: sql<number>`count(*)::int`
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(whereClause);

    return {
      data: results.map(r => ({ ...r, customerName: r.customerName || 'Walk-in Customer' })),
      total: countResult.total || 0,
      page,
      totalPages: Math.ceil((countResult.total || 0) / limit)
    };
  }

  static async getInvoiceById(id: number, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);
    return result;
  }

  static async createPayment(data: typeof payments.$inferInsert, dbClient: DbOrTx = db) {
    const [result] = await dbClient.insert(payments).values(data).returning();
    return result;
  }

  static async updateInvoicePaymentStatus(id: number, amountPaid: number, paymentStatus: any, dbClient: DbOrTx = db) {
    const [result] = await dbClient
      .update(invoices)
      .set({ paymentStatus, amountPaid })
      .where(eq(invoices.id, id))
      .returning();
    return result;
  }

  static async getInvoiceWithItemsAndPayments(id: number, dbClient: DbOrTx = db) {
    const [invoice] = await dbClient
      .select()
      .from(invoices)
      .where(eq(invoices.id, id))
      .limit(1);

    if (!invoice) return undefined;

    let customer = null;
    if (invoice.customerId) {
      const [customerData] = await dbClient
        .select({
           id: customers.id,
           name: customers.fullName,
           phone: customers.phone,
           email: customers.email,
           address: customers.address
        })
        .from(customers)
        .where(eq(customers.id, invoice.customerId))
        .limit(1);
      customer = customerData || null;
    }

    const [creator] = await dbClient
      .select({
        id: users.id,
        fullName: users.fullName,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, invoice.createdBy))
      .limit(1);

    const items = await dbClient
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const invoicePayments = await dbClient
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id));

    const formattedLines = items.map(item => ({
      productId: item.productId,
      snapshotSku: item.snapshotSku,
      snapshotName: item.snapshotName,
      quantity: item.quantity,
      unitPrice: item.snapshotPrice,
      gstPercent: item.snapshotTaxPercent,
      subtotal: item.lineTotal,
    }));

    const formattedPayments = invoicePayments.map(p => ({
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      referenceNumber: p.referenceNumber,
      notes: p.notes,
      createdAt: p.createdAt,
    }));

    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      discountTotal: invoice.discountTotal,
      grandTotal: invoice.grandTotal,
      amountPaid: invoice.amountPaid,
      paymentStatus: invoice.paymentStatus,
      status: 'COMPLETED',
      notes: invoice.notes,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      customer: customer,
      items: formattedLines,
      payments: formattedPayments,
      createdBy: creator,
    };
  }
}
