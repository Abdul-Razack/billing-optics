import { pgTable, bigserial, bigint, varchar, integer, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { customers } from './customers';
import { users } from './users';
import { offers } from './offers';
import { paymentStatusEnum, deliveryStatusEnum } from './enums';

export const invoices = pgTable('invoices', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  requestId: varchar('request_id', { length: 255 }).unique(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  customerId: bigint('customer_id', { mode: 'number' })
    .references(() => customers.id, { onDelete: 'restrict' }),
  createdBy: bigint('created_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  offerId: bigint('offer_id', { mode: 'number' })
    .references(() => offers.id, { onDelete: 'set null' }),
  subtotal: integer('subtotal').notNull().default(0),
  taxTotal: integer('tax_total').notNull().default(0),
  discountTotal: integer('discount_total').notNull().default(0),
  grandTotal: integer('grand_total').notNull().default(0),
  amountPaid: integer('amount_paid').default(0).notNull(),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('UNPAID'),
  deliveryStatus: deliveryStatusEnum('delivery_status').notNull().default('PENDING'),
  notes: varchar('notes', { length: 1000 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  subtotalCheck: check('invoices_subtotal_check', sql`${table.subtotal} >= 0`),
  taxTotalCheck: check('invoices_tax_total_check', sql`${table.taxTotal} >= 0`),
  discountTotalCheck: check('invoices_discount_total_check', sql`${table.discountTotal} >= 0`),
  grandTotalCheck: check('invoices_grand_total_check', sql`${table.grandTotal} >= 0`),
  invoiceNumberIdx: index('invoices_invoice_number_idx').on(table.invoiceNumber),
  customerIdIdx: index('invoices_customer_id_idx').on(table.customerId),
  createdAtIdx: index('invoices_created_at_idx').on(table.createdAt),
}));
