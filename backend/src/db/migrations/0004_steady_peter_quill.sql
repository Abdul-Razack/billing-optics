ALTER TABLE "lab_jobs" ADD COLUMN "order_id" bigint NOT NULL;--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD COLUMN "order_item_id" bigint;--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD CONSTRAINT "lab_jobs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_jobs" ADD CONSTRAINT "lab_jobs_order_item_id_order_items_id_fk" FOREIGN KEY ("order_item_id") REFERENCES "public"."order_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lab_jobs_order_id_idx" ON "lab_jobs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "lab_jobs_order_item_id_idx" ON "lab_jobs" USING btree ("order_item_id");