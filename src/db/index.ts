import { Surreal } from "surrealdb";

declare global {
  var __surreal: Surreal | undefined;
}

export async function getDb(): Promise<Surreal> {
  if (!globalThis.__surreal) {
    const url = process.env.SURREAL_URL ?? process.env.SURREAL_ENDPOINT;
    if (!url) {
      throw new Error("SURREAL_URL must be set");
    }

    const namespace = process.env.SURREAL_NAMESPACE ?? "web-accessibility";
    const database = process.env.SURREAL_DATABASE ?? "main";
    const token = process.env.SURREAL_TOKEN;
    const username = process.env.SURREAL_USERNAME;
    const password = process.env.SURREAL_PASSWORD;

    const db = new Surreal();
    await db.connect(url, { versionCheck: false });

    if (token) {
      await db.authenticate(token);
    } else if (username && password) {
      await db.signin({ username, password });
    } else {
      throw new Error("SURREAL_TOKEN or SURREAL_USERNAME/SURREAL_PASSWORD must be set");
    }

    await db.use({ namespace, database });
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
