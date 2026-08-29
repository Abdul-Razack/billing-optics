import { pgTable, bigserial, varchar, boolean, timestamp, bigint, jsonb, AnyPgColumn } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  parentId: bigint('parent_id', { mode: 'number' }).references((): AnyPgColumn => categories.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: varchar('description', { length: 500 }),
  attributeSchema: jsonb('attribute_schema').default('[]'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});
