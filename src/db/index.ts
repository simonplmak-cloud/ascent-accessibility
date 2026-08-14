import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

declare global {
  var __db: Database | undefined;
}

export function getDb(): Database {
  if (!globalThis.__db) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL is not set");
    }
    const client = postgres(url, { max: 1 });
    globalThis.__db = drizzle(client, { schema });
  }
  return globalThis.__db;
}
