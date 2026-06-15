ALTER TABLE "offers" ADD COLUMN "applicable_products" jsonb;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "applicable_categories" jsonb;--> statement-breakpoint
ALTER TABLE "offers" ADD COLUMN "conditions" jsonb;