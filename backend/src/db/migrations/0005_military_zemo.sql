ALTER TABLE "customers" ADD COLUMN "custom_fields" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "attributes" jsonb DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "custom_field_definitions" jsonb DEFAULT '{"products": [], "customers": []}';