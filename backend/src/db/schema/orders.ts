import { pgTable, bigserial, bigint, integer, varchar, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { customers } from './customers';
import { users } from './users';
import { offers } from './offers';
import { prescriptions } from './prescriptions';
import { locations } from './locations';

export const orders = pgTable('orders', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  requestId: varchar('request_id', { length: 255 }).unique(),
  orderNumber: varchar('order_number', { length: 100 }).notNull().unique(),
  locationId: bigint('location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' }),
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
  amountPaid: integer('amount_paid').default(0).notNull(), // Advance payment
  
  status: varchar('status', { length: 50 }).notNull().default('PENDING'), // PENDING, PROCESSING, READY, COMPLETED, CANCELLED
  
  notes: varchar('notes', { length: 1000 }),
  deliveryDate: timestamp('delivery_date'),
  salespersonId: bigint('salesperson_id', { mode: 'number' })
    .references(() => users.id, { onDelete: 'set null' }),
  prescriptionId: integer('prescription_id')
    .references(() => prescriptions.id, { onDelete: 'set null' }),
    
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  subtotalCheck: check('orders_subtotal_check', sql`${table.subtotal} >= 0`),
  taxTotalCheck: check('orders_tax_total_check', sql`${table.taxTotal} >= 0`),
  discountTotalCheck: check('orders_discount_total_check', sql`${table.discountTotal} >= 0`),
  grandTotalCheck: check('orders_grand_total_check', sql`${table.grandTotal} >= 0`),
  orderNumberIdx: index('orders_order_number_idx').on(table.orderNumber),
  customerIdIdx: index('orders_customer_id_idx').on(table.customerId),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));
