import { pgTable, bigserial, bigint, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { products } from './products';
import { users } from './users';
import { productVariants } from './productVariants';
import { locations } from './locations';
import { movementTypeEnum, referenceTypeEnum } from './enums';

export const inventoryLedger = pgTable('inventory_ledger', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'restrict' })
    .notNull(),
  productVariantId: bigint('product_variant_id', { mode: 'number' })
    .references(() => productVariants.id, { onDelete: 'restrict' }),
  fromLocationId: bigint('from_location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' }),
  toLocationId: bigint('to_location_id', { mode: 'number' })
    .references(() => locations.id, { onDelete: 'restrict' }),
  movementType: movementTypeEnum('movement_type').notNull(),
  quantityChange: integer('quantity_change').notNull(),
  unitCost: integer('unit_cost').notNull().default(0),
  referenceType: referenceTypeEnum('reference_type'),
  referenceId: bigint('reference_id', { mode: 'number' }),
  notes: varchar('notes', { length: 500 }),
  createdBy: bigint('created_by', { mode: 'number' })
    .references(() => users.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  productIdIdx: index('inventory_ledger_product_id_idx').on(table.productId),
  createdAtIdx: index('inventory_ledger_created_at_idx').on(table.createdAt),
}));
