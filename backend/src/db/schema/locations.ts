import { pgTable, bigserial, varchar, boolean, timestamp, index } from 'drizzle-orm/pg-core';

export const locations = pgTable('locations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  address: varchar('address', { length: 1000 }),
  contactNumber: varchar('contact_number', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  isActiveIdx: index('locations_is_active_idx').on(table.isActive),
}));
