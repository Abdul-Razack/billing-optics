import { pgTable, bigserial, bigint, varchar, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const productAttributeDefinitions = pgTable('product_attribute_definitions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  categoryId: bigint('category_id', { mode: 'number' })
    .references(() => categories.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 100 }).notNull(), // camelCase e.g. "frameColor"
  label: varchar('label', { length: 100 }).notNull(), // User-friendly e.g. "Frame Color"
  inputType: varchar('input_type', { length: 50 }).notNull().default('SELECT'), // SELECT, TEXT, NUMBER, BOOLEAN
  isRequired: boolean('is_required').notNull().default(false),
  displayOrder: bigint('display_order', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export const productAttributeOptions = pgTable('product_attribute_options', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  attributeDefinitionId: bigint('attribute_definition_id', { mode: 'number' })
    .references(() => productAttributeDefinitions.id, { onDelete: 'cascade' })
    .notNull(),
  value: varchar('value', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
