CREATE TABLE IF NOT EXISTS "pos_shortcuts" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "shortcut_key" varchar(50) NOT NULL,
        "product_id" bigint NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "pos_shortcuts_shortcut_key_unique" UNIQUE("shortcut_key")
);

ALTER TABLE "settings" ALTER COLUMN "currency" SET DEFAULT 'INR';
ALTER TABLE "settings" ALTER COLUMN "timezone" SET DEFAULT 'Asia/Kolkata';
ALTER TABLE "settings" ALTER COLUMN "custom_field_definitions" SET DEFAULT '{"products": [], "customers": []}';
ALTER TABLE "customers" ALTER COLUMN "custom_fields" SET DEFAULT '{}';
ALTER TABLE "users" ALTER COLUMN "preferences" SET DEFAULT '{}';
ALTER TABLE "products" ALTER COLUMN "attributes" SET DEFAULT '{}';
ALTER TABLE "audit_logs" ALTER COLUMN "result" SET DEFAULT 'SUCCESS';
DO $$ BEGIN
 ALTER TABLE "pos_shortcuts" ADD CONSTRAINT "pos_shortcuts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "pos_shortcuts_key_idx" ON "pos_shortcuts" USING btree ("shortcut_key");
