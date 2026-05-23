import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { invoices } from '../db/schema/invoices';
import { invoiceItems } from '../db/schema/invoiceItems';
import { payments } from '../db/schema/payments';
import { DbOrTx } from '../types/db';

export class BillingRepository {
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
      .set({ paymentStatus }) // amountPaid is omitted as it does not exist in schema
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

    const items = await dbClient
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, id));

    const invoicePayments = await dbClient
      .select()
      .from(payments)
      .where(eq(payments.invoiceId, id));

    return {
      ...invoice,
      items,
      payments: invoicePayments,
    };
  }
}
