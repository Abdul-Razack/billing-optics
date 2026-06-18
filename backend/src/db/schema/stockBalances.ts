import { pgTable, bigserial, bigint, integer, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { products } from './products';
import { productVariants } from './productVariants';
import { locations } from './locations';

export const stockBalances = pgTable('stock_balances', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  productVariantId: bigint('product_variant_id', { mode: 'number' })
    .references(() => productVariants.id, { onDelete: 'restrict' }),
  locationId: bigint('location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' })
    .notNull(),
  quantity: integer('quantity').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  // Ensure we only have one balance record per product/variant per location
  // Note: we can't easily create a conditional unique index if variantId is null in drizzle core natively in this syntax without SQL,
  // but if productVariantId is not used often, product + location is enough. Since variants exist, we'll index all 3.
  uniqueBalanceIdx: uniqueIndex('stock_balances_unique_idx')
    .on(table.productId, table.productVariantId, table.locationId),
    // Instead we will rely on logic, or just standard indexing.
}));
