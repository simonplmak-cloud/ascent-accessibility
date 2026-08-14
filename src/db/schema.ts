import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const assessment = pgTable(
  "assessment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    url: text("url").notNull(),
    standard: text("standard").notNull(),
    status: text("status").notNull().default("queued"),
    partial: boolean("partial").notNull().default(false),
    score: integer("score"),
    passBand: text("pass_band"),
    depth: integer("depth").notNull().default(3),
    pageCap: integer("page_cap").notNull().default(100),
    pagesScanned: integer("pages_scanned").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("assessment_status_created_idx").on(table.status, table.createdAt),
    check(
      "assessment_status_check",
      sql`${table.status} IN ('queued','running','completed','failed')`,
    ),
    check("assessment_score_check", sql`${table.score} BETWEEN 0 AND 100`),
    check(
      "assessment_pass_band_check",
      sql`${table.passBand} IN ('pass','partial','fail')`,
    ),
  ],
);

export const finding = pgTable(
  "finding",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessment.id, { onDelete: "cascade" }),
    ruleId: text("rule_id").notNull(),
    impact: text("impact").notNull(),
    description: text("description").notNull(),
    pageUrl: text("page_url").notNull(),
    elementCount: integer("element_count").notNull().default(1),
    recommendation: text("recommendation").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("finding_assessment_idx").on(table.assessmentId),
    check(
      "finding_impact_check",
      sql`${table.impact} IN ('critical','serious','moderate','minor')`,
    ),
  ],
);

export const job = pgTable(
  "job",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assessmentId: uuid("assessment_id")
      .notNull()
      .references(() => assessment.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "job_status_check",
      sql`${table.status} IN ('queued','running','completed','failed')`,
    ),
  ],
);

export const apiKey = pgTable(
  "api_key",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    keyHash: text("key_hash").notNull(),
    keyPrefix: text("key_prefix").notNull(),
    rateLimit: integer("rate_limit").notNull().default(60),
    status: text("status").notNull().default("active"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("api_key_hash_idx").on(table.keyHash),
    check("api_key_status_check", sql`${table.status} IN ('active','revoked')`),
  ],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    apiKeyId: uuid("api_key_id").references(() => apiKey.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    resourceId: uuid("resource_id"),
    ip: text("ip").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("audit_log_api_key_idx").on(table.apiKeyId, table.createdAt)],
);

export type Assessment = typeof assessment.$inferSelect;
export type NewAssessment = typeof assessment.$inferInsert;
export type Finding = typeof finding.$inferSelect;
export type NewFinding = typeof finding.$inferInsert;
export type Job = typeof job.$inferSelect;
export type NewJob = typeof job.$inferInsert;
export type ApiKey = typeof apiKey.$inferSelect;
export type NewApiKey = typeof apiKey.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
