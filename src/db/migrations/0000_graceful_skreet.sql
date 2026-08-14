CREATE TABLE "api_key" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" text NOT NULL,
	"rate_limit" integer DEFAULT 60 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "api_key_status_check" CHECK ("api_key"."status" IN ('active','revoked'))
);
--> statement-breakpoint
CREATE TABLE "assessment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"standard" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"partial" boolean DEFAULT false NOT NULL,
	"score" integer,
	"pass_band" text,
	"depth" integer DEFAULT 3 NOT NULL,
	"page_cap" integer DEFAULT 100 NOT NULL,
	"pages_scanned" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assessment_status_check" CHECK ("assessment"."status" IN ('queued','running','completed','failed')),
	CONSTRAINT "assessment_score_check" CHECK ("assessment"."score" BETWEEN 0 AND 100),
	CONSTRAINT "assessment_pass_band_check" CHECK ("assessment"."pass_band" IN ('pass','partial','fail'))
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"api_key_id" uuid,
	"action" text NOT NULL,
	"resource_id" uuid,
	"ip" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "finding" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"rule_id" text NOT NULL,
	"impact" text NOT NULL,
	"description" text NOT NULL,
	"page_url" text NOT NULL,
	"element_count" integer DEFAULT 1 NOT NULL,
	"recommendation" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "finding_impact_check" CHECK ("finding"."impact" IN ('critical','serious','moderate','minor'))
);
--> statement-breakpoint
CREATE TABLE "job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assessment_id" uuid NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_status_check" CHECK ("job"."status" IN ('queued','running','completed','failed'))
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_api_key_id_api_key_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_key"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finding" ADD CONSTRAINT "finding_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_assessment_id_assessment_id_fk" FOREIGN KEY ("assessment_id") REFERENCES "public"."assessment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_key_hash_idx" ON "api_key" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "assessment_status_created_idx" ON "assessment" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "audit_log_api_key_idx" ON "audit_log" USING btree ("api_key_id","created_at");--> statement-breakpoint
CREATE INDEX "finding_assessment_idx" ON "finding" USING btree ("assessment_id");