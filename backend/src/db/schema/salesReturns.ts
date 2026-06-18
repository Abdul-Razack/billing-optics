import { pgTable, bigserial, varchar, bigint, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { invoices } from './invoices';
import { customers } from './customers';
import { users } from './users';
import { products } from './products';
import { invoiceItems } from './invoiceItems';
import { pgEnum } from 'drizzle-orm/pg-core';

export const returnStatusEnum = pgEnum('return_status', ['PENDING', 'COMPLETED', 'REJECTED']);

export const salesReturns = pgTable('sales_returns', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  returnNumber: varchar('return_number', { length: 100 }).notNull().unique(),
  invoiceId: bigint('invoice_id', { mode: 'number' })
    .references(() => invoices.id, { onDelete: 'restrict' })
    .notNull(),
  customerId: bigint('customer_id', { mode: 'number' })
    .references(() => customers.id, { onDelete: 'restrict' })
    .notNull(),
  processedBy: bigint('processed_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  totalRefundAmount: integer('total_refund_amount').notNull().default(0),
  status: returnStatusEnum('status').notNull().default('PENDING'),
  reason: varchar('reason', { length: 1000 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
}, (table) => ({
  returnNumberIdx: index('sales_returns_return_number_idx').on(table.returnNumber),
  invoiceIdIdx: index('sales_returns_invoice_id_idx').on(table.invoiceId),
}));

export const salesReturnItems = pgTable('sales_return_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  returnId: bigint('return_id', { mode: 'number' })
    .references(() => salesReturns.id, { onDelete: 'cascade' })
    .notNull(),
  invoiceItemId: bigint('invoice_item_id', { mode: 'number' })
    .references(() => invoiceItems.id, { onDelete: 'restrict' })
    .notNull(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  quantityReturned: integer('quantity_returned').notNull(),
  refundAmount: integer('refund_amount').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
