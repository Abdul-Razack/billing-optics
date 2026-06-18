import { pgTable, bigserial, bigint, integer, index } from 'drizzle-orm/pg-core';
import { purchases } from './purchases';
import { products } from './products';
import { productVariants } from './productVariants';

export const purchaseItems = pgTable('purchase_items', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  purchaseId: bigint('purchase_id', { mode: 'number' })
    .references(() => purchases.id, { onDelete: 'cascade' })
    .notNull(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  productVariantId: bigint('product_variant_id', { mode: 'number' })
    .references(() => productVariants.id, { onDelete: 'restrict' }),
  quantityOrdered: integer('quantity_ordered').notNull().default(0),
  quantityReceived: integer('quantity_received').notNull().default(0),
  unitCost: integer('unit_cost').notNull().default(0),
  discountPercentage: integer('discount_percentage').notNull().default(0),
  taxAmount: integer('tax_amount').notNull().default(0),
  netLineTotal: integer('net_line_total').notNull().default(0),
}, (table) => ({
  purchaseIdIdx: index('purchase_items_purchase_id_idx').on(table.purchaseId),
  productIdIdx: index('purchase_items_product_id_idx').on(table.productId),
  productVariantIdIdx: index('purchase_items_product_variant_id_idx').on(table.productVariantId),
}));
