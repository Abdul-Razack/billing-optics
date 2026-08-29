ALTER TYPE "public"."reference_type" ADD VALUE 'ORDER' BEFORE 'PURCHASE';--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "invoice_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parent_id" bigint;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "attribute_schema" jsonb DEFAULT '[]';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "request_id" varchar(255);--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "order_id" bigint;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "payments_order_id_idx" ON "payments" USING btree ("order_id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_request_id_unique" UNIQUE("request_id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "order_or_invoice_check" CHECK ("payments"."order_id" IS NOT NULL OR "payments"."invoice_id" IS NOT NULL);