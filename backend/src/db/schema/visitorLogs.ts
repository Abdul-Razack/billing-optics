import { pgTable, bigserial, date, integer, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users';

export const visitorLogs = pgTable('visitor_logs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  logDate: date('log_date').notNull().unique(),
  count: integer('count').notNull(),
  notes: varchar('notes', { length: 500 }),
  createdBy: integer('created_by')
    .references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
}, (table) => ({
  dateIdx: uniqueIndex('visitor_logs_date_idx').on(table.logDate),
}));
