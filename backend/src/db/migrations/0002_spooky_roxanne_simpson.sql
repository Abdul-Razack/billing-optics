DO $$ BEGIN
 CREATE TYPE "public"."offer_type" AS ENUM('PERCENTAGE', 'FLAT_AMOUNT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"type" "offer_type" NOT NULL,
	"value" integer NOT NULL,
	"min_order_value" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pos_shortcuts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"shortcut_key" varchar(50) NOT NULL,
	"product_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pos_shortcuts_shortcut_key_unique" UNIQUE("shortcut_key")
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "offer_id" bigint;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pos_shortcuts" ADD CONSTRAINT "pos_shortcuts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offers_code_idx" ON "offers" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_shortcuts_key_idx" ON "pos_shortcuts" USING btree ("shortcut_key");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
