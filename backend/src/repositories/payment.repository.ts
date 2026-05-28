import { eq, sql, ilike, or, and, desc, asc, gte, lte } from 'drizzle-orm';
import { db } from '../config/db';
import { payments } from '../db/schema/payments';
import { invoices } from '../db/schema/invoices';
import { customers } from '../db/schema/customers';
import { DbOrTx } from '../types/db';

export class PaymentRepository {
  async createPayment(data: typeof payments.$inferInsert, tx: DbOrTx) {
    const result = await tx.insert(payments).values(data).returning();
    return result[0];
  }

  static async getPayments(params: any) {
    const page = params.page ? parseInt(params.page, 10) : 1;
    const limit = params.limit ? parseInt(params.limit, 10) : 10;
    const { search, method, startDate, endDate, sortBy } = params;

    const conditions = [];

    if (method) {
      conditions.push(eq(payments.paymentMethod, method));
    }

    if (startDate) {
      conditions.push(gte(payments.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(payments.createdAt, new Date(endDate)));
    }

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, searchTerm),
          ilike(customers.fullName, searchTerm),
          ilike(customers.phone, searchTerm),
          ilike(payments.referenceNumber, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (page - 1) * limit;

    let orderBy: any = desc(payments.createdAt);
    if (sortBy === 'oldest') {
      orderBy = asc(payments.createdAt);
    } else if (sortBy === 'highest') {
      orderBy = desc(payments.amount);
    }

    const results = await db.select({
      id: payments.id,
      invoiceId: payments.invoiceId,
      invoiceNumber: invoices.invoiceNumber,
      customerId: customers.id,
      customerName: customers.fullName,
      customerPhone: customers.phone,
      amount: payments.amount,
      paymentMethod: payments.paymentMethod,
      referenceNumber: payments.referenceNumber,
      notes: payments.notes,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(whereClause)
    .orderBy(orderBy)
    .limit(limit)
    .offset(offset);

    const [countResult] = await db.select({
      total: sql<number>`count(*)::int`
    })
    .from(payments)
    .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(whereClause);

    const formattedData = results.map(r => {
      let customerInfo = null;
      if (r.customerId) {
        customerInfo = {
          id: r.customerId,
          name: r.customerName,
          phone: r.customerPhone,
        };
      }
      return {
        id: r.id,
        invoiceId: r.invoiceId,
        invoiceNumber: r.invoiceNumber,
        amount: r.amount,
        paymentMethod: r.paymentMethod,
        referenceNumber: r.referenceNumber,
        notes: r.notes,
        createdAt: r.createdAt,
        customer: customerInfo,
      };
    });

    return {
      data: formattedData,
      total: countResult.total || 0,
      page,
      totalPages: Math.ceil((countResult.total || 0) / limit)
    };
  }
}
