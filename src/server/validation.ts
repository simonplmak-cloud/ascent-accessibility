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
