ALTER TABLE "invoices" ADD COLUMN "delivery_date" timestamp;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "salesperson_id" bigint;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "prescription_id" integer;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_salesperson_id_users_id_fk" FOREIGN KEY ("salesperson_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_prescription_id_prescriptions_id_fk" FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE set null ON UPDATE no action;