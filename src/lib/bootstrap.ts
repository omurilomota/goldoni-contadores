import { sql } from "drizzle-orm";
import { db, pool } from "@/db";
import { SCHEMA_SQL } from "@/db/bootstrap-sql";
import { clients } from "@/db/schema";
import { seedAll } from "./seed";

const globalForBootstrap = globalThis as typeof globalThis & {
  __goldoniReady?: Promise<void>;
};

/**
 * Garante que o schema existe (DDL idempotente) e que há dados de demonstração.
 * Executa uma única vez por processo.
 */
export function ensureDatabase(): Promise<void> {
  if (!globalForBootstrap.__goldoniReady) {
    globalForBootstrap.__goldoniReady = (async () => {
      await pool.query(SCHEMA_SQL);
      const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(clients);
      if (!row || row.count === 0) {
        await seedAll();
      }
    })().catch((error) => {
      globalForBootstrap.__goldoniReady = undefined;
      throw error;
    });
  }
  return globalForBootstrap.__goldoniReady;
}
