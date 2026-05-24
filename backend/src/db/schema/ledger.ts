import { pgTable, varchar, json, bigint } from 'drizzle-orm/pg-core';

export const ledger_events = pgTable('ledger_events', {
  id: varchar('id', { length: 255 }).primaryKey(),
  type: varchar('type', { length: 255 }).notNull(),
  payload: json('payload').notNull(),
  timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  prevHash: varchar('prev_hash', { length: 255 }),
  hash: varchar('hash', { length: 255 }).notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull().unique(),
  sequenceNumber: bigint('sequence_number', { mode: 'number' }).notNull().unique(),
});

export const ledger_snapshots = pgTable('ledger_snapshots', {
  id: varchar('id', { length: 255 }).primaryKey(),
  state: json('state').notNull(),
  lastEventId: varchar('last_event_id', { length: 255 }).notNull(),
  lastEventHash: varchar('last_event_hash', { length: 255 }).notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  stateRootHash: varchar('state_root_hash', { length: 255 }).notNull(),
});

export const invoices_view = pgTable('invoices_view', {
  id: varchar('id', { length: 255 }).primaryKey(),
  customerId: varchar('customer_id', { length: 255 }),
  subtotal: bigint('subtotal', { mode: 'number' }).notNull(),
  taxTotal: bigint('tax_total', { mode: 'number' }).notNull(),
  discountTotal: bigint('discount_total', { mode: 'number' }).notNull(),
  grandTotal: bigint('grand_total', { mode: 'number' }).notNull(),
  amountPaid: bigint('amount_paid', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 50 }).notNull(),
  items: json('items').notNull(),
  createdAt: bigint('created_at', { mode: 'number' }).notNull(),
  projectionVersion: bigint('projection_version', { mode: 'number' }).notNull(),
});

export const inventory_view = pgTable('inventory_view', {
  productId: varchar('product_id', { length: 255 }).primaryKey(),
  quantity: bigint('quantity', { mode: 'number' }).notNull(),
  lastUpdated: bigint('last_updated', { mode: 'number' }).notNull(),
  projectionVersion: bigint('projection_version', { mode: 'number' }).notNull(),
});

export const customer_balances_view = pgTable('customer_balances_view', {
  customerId: varchar('customer_id', { length: 255 }).primaryKey(),
  balance: bigint('balance', { mode: 'number' }).notNull(),
  lastUpdated: bigint('last_updated', { mode: 'number' }).notNull(),
  projectionVersion: bigint('projection_version', { mode: 'number' }).notNull(),
});
