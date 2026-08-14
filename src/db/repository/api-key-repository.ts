import { eq } from "drizzle-orm";
import { getDb } from "../index";
import { apiKey, auditLog } from "../schema";
import type { ApiKey, AuditLog, NewApiKey, NewAuditLog } from "../schema";

export const apiKeyRepository = {
  async create(input: NewApiKey): Promise<ApiKey> {
    const db = getDb();
    const [row] = await db.insert(apiKey).values(input).returning();
    return row!;
  },

  async findByHash(keyHash: string): Promise<ApiKey | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(apiKey)
      .where(eq(apiKey.keyHash, keyHash))
      .limit(1);
    return row;
  },

  async findById(id: string): Promise<ApiKey | undefined> {
    const db = getDb();
    const [row] = await db.select().from(apiKey).where(eq(apiKey.id, id)).limit(1);
    return row;
  },

  async list(): Promise<ApiKey[]> {
    const db = getDb();
    return db.select().from(apiKey);
  },

  async revoke(id: string): Promise<void> {
    const db = getDb();
    await db.update(apiKey).set({ status: "revoked" }).where(eq(apiKey.id, id));
  },

  async log(input: NewAuditLog): Promise<AuditLog> {
    const db = getDb();
    const [row] = await db.insert(auditLog).values(input).returning();
    return row!;
  },
};
