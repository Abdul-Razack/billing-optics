import { pgTable, uuid, timestamp, varchar, text, jsonb, bigint } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  userId: bigint('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'set null' }), // Nullable for system events
  action: varchar('action', { length: 255 }).notNull(),
  module: varchar('module', { length: 50 }).notNull(),
  recordId: varchar('record_id', { length: 255 }), // Can be string or UUID based on what we are tracking
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  device: varchar('device', { length: 255 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  result: varchar('result', { length: 20 }).default('SUCCESS').notNull(),
  details: text('details')
});
