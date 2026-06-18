import { pgTable, bigserial, bigint, varchar, jsonb, timestamp, index, integer } from 'drizzle-orm/pg-core';
import { products } from './products';

export const productVariants = pgTable('product_variants', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  sku: varchar('sku', { length: 100 }),
  barcode: varchar('barcode', { length: 100 }),
  attributes: jsonb('attributes').notNull().default('{}'), // Store sph, cyl, axis, add, color, etc.
  stockQuantity: integer('stock_quantity').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  productIdIdx: index('product_variants_product_id_idx').on(table.productId),
  skuIdx: index('product_variants_sku_idx').on(table.sku),
}));
