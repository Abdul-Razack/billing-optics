CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_number" varchar(100) NOT NULL,
	"location_id" bigint,
	"customer_id" bigint,
	"created_by" bigint NOT NULL,
	"offer_id" bigint,
	"subtotal" integer DEFAULT 0 NOT NULL,
	"tax_total" integer DEFAULT 0 NOT NULL,
	"discount_total" integer DEFAULT 0 NOT NULL,
	"grand_total" integer DEFAULT 0 NOT NULL,
	"amount_paid" integer DEFAULT 0 NOT NULL,
	"status" varchar(50) DEFAULT 'PENDING' NOT NULL,
	"notes" varchar(1000),
	"delivery_date" timestamp,
	"salesperson_id" bigint,
	"prescription_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_subtotal_check" CHECK ("orders"."subtotal" >= 0),
	CONSTRAINT "orders_tax_total_check" CHECK ("orders"."tax_total" >= 0),
	CONSTRAINT "orders_discount_total_check" CHECK ("orders"."discount_total" >= 0),
	CONSTRAINT "orders_grand_total_check" CHECK ("orders"."grand_total" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"product_id" integer NOT NULL,
	"snapshot_name" varchar(255) NOT NULL,
	"snapshot_sku" varchar(100),
	"snapshot_price" integer NOT NULL,
	"snapshot_cost_price" integer DEFAULT 0 NOT NULL,
	"snapshot_tax_percent" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"discount_percent" integer DEFAULT 0 NOT NULL,
	"line_total" integer NOT NULL,
	"lens_power_eye" varchar(10),
	"lens_power_sph" varchar(10),
	"lens_power_cyl" varchar(10),
	"lens_power_axis" integer,
	"lens_power_add" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_quantity_check" CHECK ("order_items"."quantity" > 0),
	CONSTRAINT "order_items_line_total_check" CHECK ("order_items"."line_total" >= 0)
);
--> statement-breakpoint
ALTER TABLE "lab_jobs" DROP CONSTRAINT "lab_jobs_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "lab_jobs" DROP CONSTRAINT "lab_jobs_invoice_item_id_invoice_items_id_fk";
--> statement-breakpoint
DROP INDEX "lab_jobs_invoice_id_idx";--> statement-breakpoint
DROP INDEX "lab_jobs_invoice_item_id_idx";--> statement-breakpoint
ALTER TABLE "prescription_tests" ADD COLUMN "r_prism" varchar(20);--> statement-breakpoint
ALTER TABLE "prescription_tests" ADD COLUMN "r_bc" varchar(10);--> statement-breakpoint
ALTER TABLE "prescription_tests" ADD COLUMN "r_dia" varchar(10);--> statement-breakpoint
ALTER TABLE "prescription_tests" ADD COLUMN "l_prism" varchar(20);--> statement-breakpoint
ALTER TABLE "prescription_tests" ADD COLUMN "l_bc" varchar(10);--> statement-breakpoint
ALTER TABLE "prescription_tests" ADD COLUMN "l_dia" varchar(10);--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "patient_name" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "mrp" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type" varchar(50) DEFAULT 'OTHER';--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "discount_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orders_order_number_idx" ON "orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "orders_customer_id_idx" ON "orders" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "lab_jobs" DROP COLUMN "invoice_id";--> statement-breakpoint
ALTER TABLE "lab_jobs" DROP COLUMN "invoice_item_id";