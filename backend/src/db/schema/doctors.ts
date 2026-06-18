import { pgTable, bigserial, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

export const doctors = pgTable('doctors', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().$onUpdateFn(() => new Date()),
});
