import { query } from "../index";
import type { ApiKey, AuditLog, NewApiKey, NewAuditLog } from "../schema";

type RawRecord = Record<string, unknown>;

function mapApiKey(raw: RawRecord): ApiKey {
  return {
    id: String(raw.id),
    name: String(raw.name),
    keyHash: String(raw.keyHash),
    keyPrefix: String(raw.keyPrefix),
    rateLimit: Number(raw.rateLimit),
    status: raw.status as ApiKey["status"],
    expiresAt: raw.expiresAt ? new Date(String(raw.expiresAt)) : null,
    createdAt: String(raw.createdAt),
  };
}

export const apiKeyRepository = {
  async create(input: NewApiKey): Promise<ApiKey> {
    const rows = await query<RawRecord>("CREATE api_key CONTENT $data", {
      data: input,
    });
    return mapApiKey(rows[0]!);
  },

  async findByHash(keyHash: string): Promise<ApiKey | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM api_key WHERE keyHash = $hash LIMIT 1",
      { hash: keyHash },
    );
    return rows[0] ? mapApiKey(rows[0]) : undefined;
  },

  async findById(id: string): Promise<ApiKey | undefined> {
    const rows = await query<RawRecord>(
      "SELECT * FROM api_key WHERE id = type::record($id) LIMIT 1",
      { id },
    );
    return rows[0] ? mapApiKey(rows[0]) : undefined;
  },

  async list(): Promise<ApiKey[]> {
    const rows = await query<RawRecord>("SELECT * FROM api_key");
    return rows.map(mapApiKey);
  },

  async revoke(id: string): Promise<void> {
    await query("UPDATE api_key SET status = 'revoked' WHERE id = type::record($id)", { id });
  },

  async log(input: NewAuditLog): Promise<AuditLog> {
    const rows = await query<AuditLog>("CREATE audit_log CONTENT $data", {
      data: input,
    });
    return rows[0]!;
  },
};
