CREATE TABLE IF NOT EXISTS "prescriptions" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "customer_id" bigint,
        "patient_id" bigint,
        "doctor_id" bigint,
        "prescription_type" varchar(50) DEFAULT 'EYEWEAR' NOT NULL,
        "card_description" varchar(255),
        "count_in_records" boolean DEFAULT true NOT NULL,
        "right_eye_dv_sph" numeric(5, 2),
        "right_eye_dv_cyl" numeric(5, 2),
        "right_eye_dv_axis" integer,
        "right_eye_dv_va" varchar(20),
        "right_eye_nv_sph" numeric(5, 2),
        "right_eye_nv_cyl" numeric(5, 2),
        "right_eye_nv_axis" integer,
        "right_eye_nv_va" varchar(20),
        "right_eye_add" numeric(5, 2),
        "right_eye_pd" numeric(5, 2),
        "left_eye_dv_sph" numeric(5, 2),
        "left_eye_dv_cyl" numeric(5, 2),
        "left_eye_dv_axis" integer,
        "left_eye_dv_va" varchar(20),
        "left_eye_nv_sph" numeric(5, 2),
        "left_eye_nv_cyl" numeric(5, 2),
        "left_eye_nv_axis" integer,
        "left_eye_nv_va" varchar(20),
        "left_eye_add" numeric(5, 2),
        "left_eye_pd" numeric(5, 2),
        "lens_types" jsonb,
        "notes" varchar(1000),
        "created_by" bigint NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "patients" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "customer_id" bigint,
        "name" varchar(255) NOT NULL,
        "mobile" varchar(20),
        "email" varchar(255),
        "date_of_birth" date,
        "gender" varchar(20),
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "doctors" (
        "id" bigserial PRIMARY KEY NOT NULL,
        "name" varchar(255) NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;

ALTER TABLE "patients" ADD CONSTRAINT "patients_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "prescriptions_customer_id_idx" ON "prescriptions" USING btree ("customer_id");
CREATE INDEX IF NOT EXISTS "prescriptions_patient_id_idx" ON "prescriptions" USING btree ("patient_id");
