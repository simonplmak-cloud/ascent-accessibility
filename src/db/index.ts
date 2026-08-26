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

// Close and forget the cached connection so the next getDb() re-signs in.
export async function resetDb(): Promise<void> {
  const db = globalThis.__surreal;
  globalThis.__surreal = undefined;
  if (db) {
    try {
      await db.close();
    } catch {
      /* ignore */
    }
  }
}

// SurrealDB namespace signin tokens expire. The long-lived worker connection
// then silently falls back to "anonymous" and every query fails with
// "Anonymous access not allowed", stalling the queue. Detect that and
// re-authenticate once before giving up.
function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = String((error as { message?: string }).message ?? "");
  return /anonymous access not allowed|not enough permissions|authentication failed|unauthorized/i.test(
    message,
  );
}

// SurrealDB throws "Transaction conflict: Resource busy … this transaction can be
// retried" when two writes land on the same record concurrently (e.g. the live-log
// flush vs the final persist). This is transient — retry with bounded backoff.
function isRetryableConflict(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = String((error as { message?: string }).message ?? "");
  return /transaction conflict|resource busy/i.test(message);
}

const MAX_DB_RETRIES = 3;
const DB_RETRY_BASE_MS = 100;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withDbRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_DB_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (isAuthError(error)) {
        // Expired token — re-sign in, then retry immediately.
        await resetDb();
      } else if (isRetryableConflict(error)) {
        // Transient write conflict — back off, then retry.
        await sleep(DB_RETRY_BASE_MS * 2 ** attempt);
      } else {
        throw error;
      }
    }
  }
  throw lastError;
}

export async function query<T>(
  statement: string,
  bindings?: Record<string, unknown>,
): Promise<T[]> {
  return withDbRetry(async () => {
    const db = await getDb();
    const results = await db.query(statement, bindings).json().collect();
    return ((results as unknown[])[0] as T[] | undefined) ?? [];
  });
}
