import { pgTable, bigserial, bigint, varchar, integer, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { invoices } from './invoices';
import { orders } from './orders';
import { paymentMethodEnum } from './enums';

export const payments = pgTable('payments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  orderId: bigint('order_id', { mode: 'number' })
    .references(() => orders.id, { onDelete: 'restrict' }),
  invoiceId: bigint('invoice_id', { mode: 'number' })
    .references(() => invoices.id, { onDelete: 'restrict' }),
  amount: integer('amount').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: varchar('notes', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  amountCheck: check('amount_check', sql`${table.amount} >= 0`),
  orderOrInvoiceCheck: check('order_or_invoice_check', sql`${table.orderId} IS NOT NULL OR ${table.invoiceId} IS NOT NULL`),
  orderIdIdx: index('payments_order_id_idx').on(table.orderId),
  invoiceIdIdx: index('payments_invoice_id_idx').on(table.invoiceId),
}));
