import { z } from "zod";

export const assessRequestSchema = z.object({
  url: z.string().min(1).max(2048),
  standard: z.string().min(1).max(50).default("wcag22aa"),
  scope: z.enum(["page", "site"]).default("site"),
  depth: z.number().int().min(1).max(3).optional(),
  pageCap: z.number().int().min(1).max(100).optional(),
});

export const apiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  rateLimit: z.number().int().min(1).max(1000).optional(),
});

export const exportFormatSchema = z.enum(["pdf"]);

// SurrealDB record id for assessments: `assessment:<id>` (id is a ULID).
// Used to reject malformed ids at the route boundary before they reach
// `type::record(...)`, which would otherwise throw and surface as a 500.
export const assessmentIdSchema = z.string().regex(/^assessment:[A-Za-z0-9_-]+$/);
