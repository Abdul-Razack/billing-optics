DO $$ BEGIN
 CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'READY', 'DELIVERED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."gender" AS ENUM('MALE', 'FEMALE', 'OTHER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."movement_type" AS ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_method" AS ENUM('CASH', 'CARD', 'UPI', 'BANK_TRANSFER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('UNPAID', 'PARTIAL', 'PAID', 'REFUNDED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."reference_type" AS ENUM('INVOICE', 'PURCHASE', 'RETURN', 'ADJUSTMENT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('ADMIN', 'CASHIER', 'OPTOMETRIST');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."lab_job_status" AS ENUM('PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."offer_type" AS ENUM('PERCENTAGE', 'FLAT_AMOUNT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'CASHIER' NOT NULL,
	"preferences" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255),
	"gender" "gender",
	"address" varchar(500),
	"notes" varchar(1000),
	"custom_fields" jsonb DEFAULT '{}',
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prescriptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_id" bigint NOT NULL,
	"right_eye_sph" numeric(5, 2),
	"right_eye_cyl" numeric(5, 2),
	"right_eye_axis" integer,
	"left_eye_sph" numeric(5, 2),
	"left_eye_cyl" numeric(5, 2),
	"left_eye_axis" integer,
	"add_power" numeric(5, 2),
	"pd" numeric(5, 2),
	"notes" varchar(1000),
	"created_by" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"category_id" bigint NOT NULL,
	"sku" varchar(100),
	"barcode" varchar(100),
	"name" varchar(255) NOT NULL,
	"description" varchar(1000),
	"cost_price" integer DEFAULT 0 NOT NULL,
	"selling_price" integer DEFAULT 0 NOT NULL,
	"gst_percent" integer DEFAULT 18 NOT NULL,
	"min_stock_alert" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"attributes" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku"),
	CONSTRAINT "products_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"movement_type" "movement_type" NOT NULL,
	"quantity_change" integer NOT NULL,
	"reference_type" "reference_type",
	"reference_id" bigint,
	"notes" varchar(500),
	"created_by" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vendors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact_person" varchar(255),
	"phone" varchar(50),
	"email" varchar(255),
	"address" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "offers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50),
	"type" "offer_type" NOT NULL,
	"value" integer NOT NULL,
	"min_order_value" integer DEFAULT 0 NOT NULL,
	"applicable_products" jsonb,
	"applicable_categories" jsonb,
	"conditions" jsonb,
	"start_date" timestamp,
	"end_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"request_id" varchar(255),
	"invoice_number" varchar(100) NOT NULL,
	"customer_id" bigint,
	"offer_id" bigint,
	"created_by" bigint NOT NULL,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_total" integer DEFAULT 0 NOT NULL,
	"discount_total" integer DEFAULT 0 NOT NULL,
	"grand_total" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"payment_status" "payment_status" DEFAULT 'UNPAID' NOT NULL,
	"delivery_status" "delivery_status" DEFAULT 'PENDING' NOT NULL,
	"notes" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_request_id_unique" UNIQUE("request_id"),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoice_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"snapshot_name" varchar(255) NOT NULL,
	"snapshot_sku" varchar(100) NOT NULL,
	"snapshot_price" integer NOT NULL,
	"snapshot_cost_price" integer DEFAULT 0 NOT NULL,
	"snapshot_tax_percent" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"line_total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"invoice_id" bigint NOT NULL,
	"amount" integer NOT NULL,
	"payment_method" "payment_method" DEFAULT 'CASH' NOT NULL,
	"reference_number" varchar(100),
	"notes" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lab_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"invoice_id" bigint NOT NULL,
	"vendor_id" bigint,
	"status" "lab_job_status" DEFAULT 'PENDING' NOT NULL,
	"notes" varchar(1000),
	"expected_date" date,
	"sent_date" date,
	"received_date" date,
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
CREATE TABLE IF NOT EXISTS "settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"address" varchar(500),
	"gst_number" varchar(50),
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"custom_field_definitions" jsonb DEFAULT '{"products": [], "customers": []}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer_balances_view" (
	"customer_id" varchar(255) PRIMARY KEY NOT NULL,
	"balance" bigint NOT NULL,
	"last_updated" bigint NOT NULL,
	"projection_version" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_view" (
	"product_id" varchar(255) PRIMARY KEY NOT NULL,
	"quantity" bigint NOT NULL,
	"last_updated" bigint NOT NULL,
	"projection_version" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices_view" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"customer_id" varchar(255),
	"subtotal" bigint NOT NULL,
	"tax_total" bigint NOT NULL,
	"discount_total" bigint NOT NULL,
	"grand_total" bigint NOT NULL,
	"amount_paid" bigint NOT NULL,
	"status" varchar(50) NOT NULL,
	"items" json NOT NULL,
	"created_at" bigint NOT NULL,
	"projection_version" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ledger_events" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"type" varchar(255) NOT NULL,
	"payload" json NOT NULL,
	"timestamp" bigint NOT NULL,
	"prev_hash" varchar(255),
	"hash" varchar(255) NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"sequence_number" bigint NOT NULL,
	CONSTRAINT "ledger_events_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "ledger_events_sequence_number_unique" UNIQUE("sequence_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ledger_snapshots" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"state" json NOT NULL,
	"last_event_id" varchar(255) NOT NULL,
	"last_event_hash" varchar(255) NOT NULL,
	"created_at" bigint NOT NULL,
	"state_root_hash" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"user_id" bigint,
	"action" varchar(255) NOT NULL,
	"module" varchar(50) NOT NULL,
	"record_id" varchar(255),
	"old_values" jsonb,
	"new_values" jsonb,
	"device" varchar(255),
	"ip_address" varchar(45),
	"result" varchar(20) DEFAULT 'SUCCESS' NOT NULL,
	"details" text
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_jobs" ADD CONSTRAINT "lab_jobs_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "lab_jobs" ADD CONSTRAINT "lab_jobs_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pos_shortcuts" ADD CONSTRAINT "pos_shortcuts_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "prescriptions_customer_id_idx" ON "prescriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_sku_idx" ON "products" USING btree ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_barcode_idx" ON "products" USING btree ("barcode");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_is_active_idx" ON "products" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_ledger_product_id_idx" ON "inventory_ledger" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_ledger_created_at_idx" ON "inventory_ledger" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_invoice_number_idx" ON "invoices" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_customer_id_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_items_product_id_idx" ON "invoice_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vendors_name_idx" ON "vendors" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "offers_code_idx" ON "offers" USING btree ("code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_shortcuts_key_idx" ON "pos_shortcuts" USING btree ("shortcut_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_invoice_id_idx" ON "lab_jobs" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_vendor_id_idx" ON "lab_jobs" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_status_idx" ON "lab_jobs" USING btree ("status");