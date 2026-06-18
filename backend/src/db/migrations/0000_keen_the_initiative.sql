DO $$ BEGIN
 CREATE TYPE "public"."adjustment_type" AS ENUM('FREIGHT', 'DISCOUNT', 'REBATE', 'FITTING_CHARGE');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."audit_status" AS ENUM('IN_PROGRESS', 'RECONCILED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."barcode_status" AS ENUM('PENDING_PRINT', 'ACTIVE', 'SOLD', 'RETURNED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."delivery_status" AS ENUM('PENDING', 'READY', 'DELIVERED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."document_type" AS ENUM('INVOICE', 'CHALLAN');
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
 CREATE TYPE "public"."lab_job_status" AS ENUM('PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."movement_type" AS ENUM('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN', 'AUDIT_ADJUSTMENT');
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
 CREATE TYPE "public"."purchase_status" AS ENUM('DRAFT', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."reference_type" AS ENUM('INVOICE', 'PURCHASE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'AUDIT');
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
 CREATE TYPE "public"."transfer_status" AS ENUM('DRAFT', 'IN_TRANSIT', 'RECEIVED', 'PARTIALLY_RECEIVED', 'CANCELLED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."return_status" AS ENUM('PENDING', 'COMPLETED', 'REJECTED');
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
	"location_id" bigint,
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
	"date_of_birth" timestamp,
	"anniversary_date" timestamp,
	"is_dnd" boolean DEFAULT false NOT NULL,
	"labels" jsonb DEFAULT '[]',
	"loyalty_points" integer DEFAULT 0 NOT NULL,
	"referred_by" bigint,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "patients" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"customer_id" bigint,
	"name" varchar(255) NOT NULL,
	"mobile" varchar(20),
	"email" varchar(255),
	"date_of_birth" date,
	"gender" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "doctors" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prescription_tests" (
	"id" serial PRIMARY KEY NOT NULL,
	"prescription_id" integer NOT NULL,
	"test_type" varchar(50) NOT NULL,
	"r_dv_sph" varchar(10),
	"r_dv_cyl" varchar(10),
	"r_dv_axis" integer,
	"r_dv_va" varchar(20),
	"r_nv_sph" varchar(10),
	"r_nv_cyl" varchar(10),
	"r_nv_axis" integer,
	"r_nv_va" varchar(20),
	"r_add" varchar(10),
	"r_pd" varchar(10),
	"l_dv_sph" varchar(10),
	"l_dv_cyl" varchar(10),
	"l_dv_axis" integer,
	"l_dv_va" varchar(20),
	"l_nv_sph" varchar(10),
	"l_nv_cyl" varchar(10),
	"l_nv_axis" integer,
	"l_nv_va" varchar(20),
	"l_add" varchar(10),
	"l_pd" varchar(10)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prescriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer,
	"patient_id" integer,
	"doctor_id" integer,
	"prescription_type" varchar(50) DEFAULT 'EYEWEAR',
	"card_description" varchar(255),
	"count_in_records" boolean DEFAULT true,
	"lens_types" jsonb,
	"notes" text,
	"created_by" integer NOT NULL,
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
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_attribute_options" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"attribute_definition_id" bigint NOT NULL,
	"value" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
	"product_variant_id" bigint,
	"from_location_id" bigint,
	"to_location_id" bigint,
	"movement_type" "movement_type" NOT NULL,
	"quantity_change" integer NOT NULL,
	"unit_cost" integer DEFAULT 0 NOT NULL,
	"reference_type" "reference_type",
	"reference_id" bigint,
	"notes" varchar(500),
	"created_by" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "invoices" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"request_id" varchar(255),
	"invoice_number" varchar(100) NOT NULL,
	"location_id" bigint,
	"customer_id" bigint,
	"created_by" bigint NOT NULL,
	"offer_id" bigint,
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
CREATE TABLE IF NOT EXISTS "settings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"phone" varchar(50),
	"email" varchar(255),
	"address" varchar(500),
	"gst_number" varchar(50),
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"timezone" varchar(50) DEFAULT 'Asia/Kolkata' NOT NULL,
	"printer_size" varchar(20) DEFAULT '80mm' NOT NULL,
	"multi_branch_enabled" boolean DEFAULT false NOT NULL,
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
	"start_date" timestamp,
	"end_date" timestamp,
	"applicable_products" jsonb,
	"applicable_categories" jsonb,
	"conditions" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE IF NOT EXISTS "purchases" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"supplier_id" bigint NOT NULL,
	"billing_branch_id" bigint,
	"receiving_branch_id" bigint,
	"bill_number" varchar(100),
	"challan_number" varchar(100),
	"document_type" "document_type" DEFAULT 'INVOICE' NOT NULL,
	"status" "purchase_status" DEFAULT 'DRAFT' NOT NULL,
	"tax_rule_id" bigint,
	"total_base_amount" integer DEFAULT 0 NOT NULL,
	"total_tax_amount" integer DEFAULT 0 NOT NULL,
	"total_discount_amount" integer DEFAULT 0 NOT NULL,
	"net_amount" integer DEFAULT 0 NOT NULL,
	"purchase_date" timestamp,
	"due_date" timestamp,
	"notes" varchar(1000),
	"created_by" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_variants" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"sku" varchar(100),
	"barcode" varchar(100),
	"attributes" jsonb DEFAULT '{}' NOT NULL,
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"purchase_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"product_variant_id" bigint,
	"quantity_ordered" integer DEFAULT 0 NOT NULL,
	"quantity_received" integer DEFAULT 0 NOT NULL,
	"unit_cost" integer DEFAULT 0 NOT NULL,
	"discount_percentage" integer DEFAULT 0 NOT NULL,
	"tax_amount" integer DEFAULT 0 NOT NULL,
	"net_line_total" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "barcodes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"barcode_string" varchar(100) NOT NULL,
	"product_variant_id" bigint NOT NULL,
	"inventory_ledger_id" bigint,
	"status" "barcode_status" DEFAULT 'PENDING_PRINT' NOT NULL,
	"batch_number" varchar(100),
	"mfg_date" timestamp,
	"expiry_date" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "barcodes_barcode_string_unique" UNIQUE("barcode_string")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "purchase_adjustments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"purchase_id" bigint NOT NULL,
	"adjustment_type" "adjustment_type" NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"notes" varchar(500),
	"created_by" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "locations" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"address" varchar(1000),
	"contact_number" varchar(50),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_balances" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"product_variant_id" bigint,
	"location_id" bigint NOT NULL,
	"quantity" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_transfer_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transfer_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"product_variant_id" bigint,
	"quantity_sent" integer DEFAULT 0 NOT NULL,
	"quantity_received" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stock_transfers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"transfer_no" varchar(50) NOT NULL,
	"from_location_id" bigint NOT NULL,
	"to_location_id" bigint NOT NULL,
	"status" "transfer_status" DEFAULT 'DRAFT' NOT NULL,
	"notes" varchar(1000),
	"dispatched_by_user_id" bigint,
	"received_by_user_id" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_transfers_transfer_no_unique" UNIQUE("transfer_no")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_audit_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"audit_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"product_variant_id" bigint,
	"expected_qty" integer NOT NULL,
	"counted_qty" integer DEFAULT 0 NOT NULL,
	"variance" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory_audits" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"audit_no" varchar(50) NOT NULL,
	"location_id" bigint NOT NULL,
	"status" "audit_status" DEFAULT 'IN_PROGRESS' NOT NULL,
	"notes" varchar(1000),
	"created_by_user_id" bigint NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_audits_audit_no_unique" UNIQUE("audit_no")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_return_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"return_id" bigint NOT NULL,
	"invoice_item_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"quantity_returned" integer NOT NULL,
	"refund_amount" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_returns" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"return_number" varchar(100) NOT NULL,
	"invoice_id" bigint NOT NULL,
	"customer_id" bigint NOT NULL,
	"processed_by" bigint NOT NULL,
	"total_refund_amount" integer DEFAULT 0 NOT NULL,
	"status" "return_status" DEFAULT 'PENDING' NOT NULL,
	"reason" varchar(1000),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sales_returns_return_number_unique" UNIQUE("return_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "visitor_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"log_date" date NOT NULL,
	"count" integer NOT NULL,
	"notes" varchar(500),
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitor_logs_log_date_unique" UNIQUE("log_date")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "patients" ADD CONSTRAINT "patients_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescription_tests" ADD CONSTRAINT "prescription_tests_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_attribute_definitions" ADD CONSTRAINT "product_attribute_definitions_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_attribute_options" ADD CONSTRAINT "product_attribute_options_attribute_definition_id_product_attribute_definitions_id_fk" FOREIGN KEY ("attribute_definition_id") REFERENCES "public"."product_attribute_definitions"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_from_location_id_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_ledger" ADD CONSTRAINT "inventory_ledger_to_location_id_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
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
 ALTER TABLE "invoices" ADD CONSTRAINT "invoices_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
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
 ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
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
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_vendors_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."vendors"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_billing_branch_id_locations_id_fk" FOREIGN KEY ("billing_branch_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_receiving_branch_id_locations_id_fk" FOREIGN KEY ("receiving_branch_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchases" ADD CONSTRAINT "purchases_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "barcodes" ADD CONSTRAINT "barcodes_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "barcodes" ADD CONSTRAINT "barcodes_inventory_ledger_id_inventory_ledger_id_fk" FOREIGN KEY ("inventory_ledger_id") REFERENCES "public"."inventory_ledger"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_adjustments" ADD CONSTRAINT "purchase_adjustments_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "purchase_adjustments" ADD CONSTRAINT "purchase_adjustments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_balances" ADD CONSTRAINT "stock_balances_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_transfer_id_stock_transfers_id_fk" FOREIGN KEY ("transfer_id") REFERENCES "public"."stock_transfers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_location_id_locations_id_fk" FOREIGN KEY ("from_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_location_id_locations_id_fk" FOREIGN KEY ("to_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_dispatched_by_user_id_users_id_fk" FOREIGN KEY ("dispatched_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_received_by_user_id_users_id_fk" FOREIGN KEY ("received_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_audit_id_inventory_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."inventory_audits"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_audit_items" ADD CONSTRAINT "inventory_audit_items_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_audits" ADD CONSTRAINT "inventory_audits_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "inventory_audits" ADD CONSTRAINT "inventory_audits_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_return_id_sales_returns_id_fk" FOREIGN KEY ("return_id") REFERENCES "public"."sales_returns"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_invoice_item_id_invoice_items_id_fk" FOREIGN KEY ("invoice_item_id") REFERENCES "public"."invoice_items"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_return_items" ADD CONSTRAINT "sales_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_returns" ADD CONSTRAINT "sales_returns_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "visitor_logs" ADD CONSTRAINT "visitor_logs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "customers_phone_idx" ON "customers" USING btree ("phone");--> statement-breakpoint
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
CREATE INDEX IF NOT EXISTS "lab_jobs_invoice_id_idx" ON "lab_jobs" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_vendor_id_idx" ON "lab_jobs" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_status_idx" ON "lab_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pos_shortcuts_key_idx" ON "pos_shortcuts" USING btree ("shortcut_key");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchases_supplier_id_idx" ON "purchases" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchases_bill_number_idx" ON "purchases" USING btree ("bill_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchases_challan_number_idx" ON "purchases" USING btree ("challan_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchases_status_idx" ON "purchases" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_product_id_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "product_variants_sku_idx" ON "product_variants" USING btree ("sku");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_items_purchase_id_idx" ON "purchase_items" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_items_product_id_idx" ON "purchase_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_items_product_variant_id_idx" ON "purchase_items" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "barcodes_barcode_string_idx" ON "barcodes" USING btree ("barcode_string");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "barcodes_product_variant_id_idx" ON "barcodes" USING btree ("product_variant_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "barcodes_status_idx" ON "barcodes" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_adjustments_purchase_id_idx" ON "purchase_adjustments" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "locations_is_active_idx" ON "locations" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "stock_balances_unique_idx" ON "stock_balances" USING btree ("product_id","product_variant_id","location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_transfers_status_idx" ON "stock_transfers" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "stock_transfers_created_at_idx" ON "stock_transfers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_audits_status_idx" ON "inventory_audits" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "inventory_audits_location_idx" ON "inventory_audits" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_returns_return_number_idx" ON "sales_returns" USING btree ("return_number");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sales_returns_invoice_id_idx" ON "sales_returns" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "visitor_logs_date_idx" ON "visitor_logs" USING btree ("log_date");