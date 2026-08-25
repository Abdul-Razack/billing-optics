CREATE TYPE "public"."lens_source" AS ENUM('ADD_NEW', 'CUSTOMER_OWN');--> statement-breakpoint
ALTER TABLE "prescriptions" ADD COLUMN "fitting_parameters" jsonb;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "lens_source" "lens_source";--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD COLUMN "invoice_item_id" bigint;--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD COLUMN "prescription_id" integer;--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD CONSTRAINT "lab_jobs_invoice_item_id_invoice_items_id_fk" FOREIGN KEY ("invoice_item_id") REFERENCES "public"."invoice_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD CONSTRAINT "lab_jobs_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lab_jobs_invoice_item_id_idx" ON "lab_jobs" USING btree ("invoice_item_id");--> statement-breakpoint
CREATE INDEX "lab_jobs_prescription_id_idx" ON "lab_jobs" USING btree ("prescription_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "cost_price_check" CHECK ("products"."cost_price" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "selling_price_check" CHECK ("products"."selling_price" >= 0);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "gst_percent_check" CHECK ("products"."gst_percent" BETWEEN 0 AND 100);--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "min_stock_alert_check" CHECK ("products"."min_stock_alert" >= 0);--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_subtotal_check" CHECK ("invoices"."subtotal" >= 0);--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tax_total_check" CHECK ("invoices"."tax_total" >= 0);--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_discount_total_check" CHECK ("invoices"."discount_total" >= 0);--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_grand_total_check" CHECK ("invoices"."grand_total" >= 0);--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "snapshot_price_check" CHECK ("invoice_items"."snapshot_price" >= 0);--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "snapshot_cost_price_check" CHECK ("invoice_items"."snapshot_cost_price" >= 0);--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "snapshot_tax_percent_check" CHECK ("invoice_items"."snapshot_tax_percent" BETWEEN 0 AND 100);--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "quantity_check" CHECK ("invoice_items"."quantity" > 0);--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "line_total_check" CHECK ("invoice_items"."line_total" >= 0);--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "amount_check" CHECK ("payments"."amount" >= 0);--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_single_row_check" CHECK ("settings"."id" = 1);--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_value_check" CHECK ("offers"."value" > 0);--> statement-breakpoint
ALTER TABLE "offers" ADD CONSTRAINT "offers_min_order_check" CHECK ("offers"."min_order_value" >= 0);