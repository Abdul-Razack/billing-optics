ALTER TABLE "invoices" ADD COLUMN "request_id" varchar(255);--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "snapshot_cost_price" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_request_id_unique" UNIQUE("request_id");