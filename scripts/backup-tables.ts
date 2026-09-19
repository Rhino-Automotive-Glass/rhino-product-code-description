/**
 * backup-tables.ts
 *
 * Writes a JSON snapshot of every API-reachable table to
 * backups/YYYY-MM-DD/snapshot_<timestamp>.json
 *
 * Lightweight, dependency-free alternative to a full pg_dump when the
 * PostgreSQL client tools are unavailable. Restore with
 * scripts/restore-snapshot.ts (`npm run db:restore-snapshot`).
 *
 * Usage:
 *   npm run db:snapshot                      # all tables in TABLES
 *   npm run db:snapshot -- product_codes     # only the named table(s)
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 * The npm script loads them from .env.local via `tsx --env-file`.
 *
 * LIMITATIONS — this is not a substitute for scripts/backup-db.sh:
 *   - Table rows only. No schema, indexes, constraints, triggers, functions,
 *     or RLS policies.
 *   - Only tables exposed through PostgREST. Tables reachable solely via
 *     SECURITY DEFINER functions cannot be read here.
 *   - No auth.users. Restoring user_roles onto a project whose auth users
 *     differ will fail its foreign keys.
 * Use `npm run db:backup` (pg_dump) for a complete, restorable backup.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createAdminClient } from '../app/lib/supabase/admin';

/** Tables captured by a full snapshot, ordered parents-before-children so a
 *  restore can replay them in the same order without violating foreign keys. */
const TABLES = ['roles', 'user_roles', 'product_codes', 'audit_logs'] as const;

/** Rows fetched per page, kept small to stay under statement timeouts. */
const BATCH_SIZE = 200;

/** Column every table is ordered by for stable, resumable pagination. */
const ORDER_COLUMN = 'id';

type Snapshot = {
  exportedAt: string;
  tables: Record<string, { count: number; rows: unknown[] }>;
};

/** Fetches every row of one table, paging until a short page comes back. */
async function fetchTable(
  supabase: ReturnType<typeof createAdminClient>,
  table: string,
): Promise<unknown[]> {
  const rows: unknown[] = [];
  let from = 0;

  for (;;) {
    const to = from + BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(ORDER_COLUMN, { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`[snapshot] FATAL: ${table}: failed to fetch rows ${from}-${to}: ${error.message}`);
      process.exit(1);
    }
    if (!data || data.length === 0) break;

    rows.push(...data);
    // A short page means the table is exhausted; saves one empty round trip.
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }

  return rows;
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2);
  const tables: readonly string[] = requested.length > 0 ? requested : TABLES;

  const unknownTables = requested.filter((t) => !TABLES.includes(t as (typeof TABLES)[number]));
  if (unknownTables.length > 0) {
    console.error(`[snapshot] FATAL: unknown table(s): ${unknownTables.join(', ')}`);
    console.error(`[snapshot]        known tables: ${TABLES.join(', ')}`);
    process.exit(1);
  }

  const supabase = createAdminClient();
  const now = new Date();
  const snapshot: Snapshot = { exportedAt: now.toISOString(), tables: {} };

  for (const table of tables) {
    const rows = await fetchTable(supabase, table);
    snapshot.tables[table] = { count: rows.length, rows };
    console.log(`[snapshot] ${table}: ${rows.length} rows`);
  }

  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const stamp = now.toISOString().replace(/[:.]/g, '-'); // file-safe timestamp

  const dir = join(process.cwd(), 'backups', date);
  mkdirSync(dir, { recursive: true });

  const file = join(dir, `snapshot_${stamp}.json`);
  writeFileSync(file, JSON.stringify(snapshot, null, 2));

  const total = Object.values(snapshot.tables).reduce((sum, t) => sum + t.count, 0);
  console.log(`[snapshot] wrote ${total} rows across ${tables.length} table(s) -> ${file}`);
}

main().catch((err) => {
  console.error('[snapshot] FATAL:', err);
  process.exit(1);
});
