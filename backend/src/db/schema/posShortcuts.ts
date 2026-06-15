import { pgTable, bigserial, bigint, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { products } from './products';

export const posShortcuts = pgTable('pos_shortcuts', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  shortcutKey: varchar('shortcut_key', { length: 50 }).notNull().unique(),
  productId: bigint('product_id', { mode: 'number' })
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  shortcutKeyIdx: index('pos_shortcuts_key_idx').on(table.shortcutKey),
}));
