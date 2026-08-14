import { Surreal } from "surrealdb";

declare global {
  var __surreal: Surreal | undefined;
}

export async function getDb(): Promise<Surreal> {
  if (!globalThis.__surreal) {
    const url = process.env.SURREAL_URL ?? process.env.SURREAL_ENDPOINT;
    const token = process.env.SURREAL_TOKEN;
    if (!url || !token) {
      throw new Error("SURREAL_URL and SURREAL_TOKEN must be set");
    }
    const db = new Surreal();
    await db.connect(url, {
      namespace: process.env.SURREAL_NAMESPACE ?? "valuation",
      database: process.env.SURREAL_DATABASE ?? "main",
      authentication: token,
      versionCheck: false,
    });
    globalThis.__surreal = db;
  }
  return globalThis.__surreal;
}

export async function query<T>(
  statement: string,
  bindings?: Record<string, unknown>,
): Promise<T[]> {
  const db = await getDb();
  const results = await db.query(statement, bindings).json().collect();
  return ((results as unknown[])[0] as T[] | undefined) ?? [];
}
