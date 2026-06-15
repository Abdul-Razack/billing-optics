DO $$ BEGIN
 CREATE TYPE "public"."lab_job_status" AS ENUM('PENDING', 'SENT_TO_LAB', 'PROCESSING', 'RECEIVED', 'READY', 'DELIVERED');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
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
CREATE INDEX IF NOT EXISTS "vendors_name_idx" ON "vendors" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_invoice_id_idx" ON "lab_jobs" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_vendor_id_idx" ON "lab_jobs" USING btree ("vendor_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "lab_jobs_status_idx" ON "lab_jobs" USING btree ("status");