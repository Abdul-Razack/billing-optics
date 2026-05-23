import { pgTable, bigserial, bigint, varchar, integer, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { invoices } from './invoices';
import { paymentMethodEnum } from './enums';

export const payments = pgTable('payments', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  invoiceId: bigint('invoice_id', { mode: 'number' })
    .references(() => invoices.id, { onDelete: 'restrict' })
    .notNull(),
  amount: integer('amount').notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  referenceNumber: varchar('reference_number', { length: 100 }),
  notes: varchar('notes', { length: 500 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  amountCheck: check('amount_check', sql`${table.amount} >= 0`),
  invoiceIdIdx: index('payments_invoice_id_idx').on(table.invoiceId),
}));
