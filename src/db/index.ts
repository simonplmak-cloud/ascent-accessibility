import { Surreal } from "surrealdb";

declare global {
  var __surreal: Surreal | undefined;
}

export interface DbConfig {
  url: string;
  namespace: string;
  database: string;
  token: string | undefined;
  username: string | undefined;
  password: string | undefined;
}

export function dbConfig(): DbConfig {
  const url = process.env.SURREAL_URL ?? process.env.SURREAL_ENDPOINT;
  if (!url) {
    throw new Error("SURREAL_URL must be set");
  }
  return {
    url,
    namespace: process.env.SURREAL_NAMESPACE ?? "wcag-score",
    database: process.env.SURREAL_DATABASE ?? "main",
    token: process.env.SURREAL_TOKEN,
    username: process.env.SURREAL_USERNAME,
    password: process.env.SURREAL_PASSWORD,
  };
}

export async function createConnection(): Promise<Surreal> {
  const { url } = dbConfig();
  const db = new Surreal();
  await db.connect(url, { versionCheck: false });
  return db;
}

export async function getDb(): Promise<Surreal> {
  if (!globalThis.__surreal) {
    const { namespace, database, token, username, password } = dbConfig();
    const db = await createConnection();

    if (token) {
      await db.authenticate(token);
    } else if (username && password) {
      await db.signin({ namespace, username, password });
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
