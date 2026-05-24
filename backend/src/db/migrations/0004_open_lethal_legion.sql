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
