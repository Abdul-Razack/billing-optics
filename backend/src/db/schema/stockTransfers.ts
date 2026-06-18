import { pgTable, bigserial, varchar, bigint, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { locations } from './locations';
import { users } from './users';
import { transferStatusEnum } from './enums';
import { products } from './products';
import { productVariants } from './productVariants';

export const stockTransfers = pgTable('stock_transfers', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  transferNo: varchar('transfer_no', { length: 50 }).unique().notNull(),
  fromLocationId: bigint('from_location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' })
    .notNull(),
  toLocationId: bigint('to_location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' })
    .notNull(),
  status: transferStatusEnum('status').notNull().default('DRAFT'),
  notes: varchar('notes', { length: 1000 }),
  dispatchedByUserId: bigint('dispatched_by_user_id', { mode: 'number' })
    .references(() => users.id, { onDelete: 'set null' }),
  receivedByUserId: bigint('received_by_user_id', { mode: 'number' })
    .references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  statusIdx: index('stock_transfers_status_idx').on(table.status),
  createdAtIdx: index('stock_transfers_created_at_idx').on(table.createdAt),
}));

export const stockTransferItems = pgTable('stock_transfer_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  transferId: bigint('transfer_id', { mode: 'number' })
    .references(() => stockTransfers.id, { onDelete: 'cascade' })
    .notNull(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  productVariantId: bigint('product_variant_id', { mode: 'number' })
    .references(() => productVariants.id, { onDelete: 'restrict' }),
  quantitySent: integer('quantity_sent').notNull().default(0),
  quantityReceived: integer('quantity_received').notNull().default(0),
});
