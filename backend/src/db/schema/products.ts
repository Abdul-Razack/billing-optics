import { pgTable, bigserial, bigint, varchar, integer, boolean, timestamp, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { categories } from './categories';

export const products = pgTable('products', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  categoryId: bigint('category_id', { mode: 'number' })
    .references(() => categories.id, { onDelete: 'restrict' })
    .notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 1000 }),
  costPrice: integer('cost_price').notNull().default(0),
  sellingPrice: integer('selling_price').notNull().default(0),
  gstPercent: integer('gst_percent').notNull().default(18),
  minStockAlert: integer('min_stock_alert').notNull().default(5),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  costPriceCheck: check('cost_price_check', sql`${table.costPrice} >= 0`),
  sellingPriceCheck: check('selling_price_check', sql`${table.sellingPrice} >= 0`),
  gstPercentCheck: check('gst_percent_check', sql`${table.gstPercent} BETWEEN 0 AND 100`),
  minStockAlertCheck: check('min_stock_alert_check', sql`${table.minStockAlert} >= 0`),
  skuIdx: index('products_sku_idx').on(table.sku),
  barcodeIdx: index('products_barcode_idx').on(table.barcode),
  categoryIdIdx: index('products_category_id_idx').on(table.categoryId),
  isActiveIdx: index('products_is_active_idx').on(table.isActive),
}));
