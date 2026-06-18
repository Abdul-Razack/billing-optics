import { pool } from './src/config/db';

const sql = `
CREATE TABLE IF NOT EXISTS "product_attribute_definitions" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "category_id" bigint NOT NULL,
        "name" varchar(100) NOT NULL,
        "label" varchar(100) NOT NULL,
        "input_type" varchar(50) DEFAULT 'SELECT' NOT NULL,
        "is_required" boolean DEFAULT false NOT NULL,
        "display_order" bigint DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "product_attribute_options" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "attribute_definition_id" bigint NOT NULL,
        "value" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "product_attribute_definitions" ADD CONSTRAINT "product_attribute_definitions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "product_attribute_options" ADD CONSTRAINT "product_attribute_options_attribute_definition_id_product_attribute_definitions_id_fk" FOREIGN KEY ("attribute_definition_id") REFERENCES "public"."product_attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
`;

async function run() {
  try {
    console.log("Running migration for product attributes...");
    await pool.query(sql);
    console.log("Migration successful!");
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
