/**
 * restore-snapshot.ts
 *
 * Restores table rows from a JSON snapshot written by scripts/backup-tables.ts
 * (or the older product_codes-only format).
 *
 * Usage:
 *   npm run db:restore-snapshot                          # latest snapshot
 *   npm run db:restore-snapshot -- backups/.../snap.json # a specific file
 *   npm run db:restore-snapshot -- --table product_codes # one table only
 *
 * WARNING: destructive. Rows in the snapshot overwrite rows with the same id
 * in the live database. A typed confirmation is required; set RESTORE_YES=1
 * to skip it in non-interactive environments.
 *
 * NOT a full restore. It upserts rows and nothing else:
 *   - Rows created since the snapshot are LEFT IN PLACE, not deleted. This
 *     restores lost/changed rows; it does not rewind the table to a point in
 *     time. Use pg_restore (npm run db:restore) for that.
 *   - No schema, indexes, constraints, triggers, functions, or RLS policies.
 *   - No auth.users, so user_roles rows referencing users that do not exist
 *     in the target project will fail their foreign key.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { createAdminClient } from '../app/lib/supabase/admin';

/** Restore order: parents before children so foreign keys resolve. */
const TABLE_ORDER = ['roles', 'user_roles', 'product_codes', 'audit_logs'] as const;

/** Rows sent per upsert call. */
const BATCH_SIZE = 200;

/** Conflict target used to decide insert-vs-update. */
const CONFLICT_COLUMN = 'id';

type TableRows = Record<string, { rows: unknown[] }>;

/** Reads a snapshot file and normalises both formats into { table: rows }. */
function parseSnapshot(file: string): TableRows {
  const raw = JSON.parse(readFileSync(file, 'utf8'));

  // Current format: { exportedAt, tables: { name: { count, rows } } }
  if (raw && typeof raw === 'object' && raw.tables) {
    return raw.tables as TableRows;
  }

  // Legacy format: { table: 'product_codes', count, rows: [...] }
  if (raw && typeof raw === 'object' && raw.table && Array.isArray(raw.rows)) {
    return { [raw.table]: { rows: raw.rows } };
  }

  console.error(`[restore-snapshot] FATAL: unrecognised snapshot format in ${file}`);
  process.exit(1);
}

/** Walks backups/ and returns the most recently modified .json snapshot. */
function findLatestSnapshot(root: string): string {
  let newest: { path: string; mtimeMs: number } | undefined;

  let dayDirs: string[];
  try {
    dayDirs = readdirSync(root);
  } catch {
    console.error(`[restore-snapshot] FATAL: no backups directory at ${root}`);
    console.error(`[restore-snapshot]        Run 'npm run db:snapshot' first.`);
    process.exit(1);
  }

  for (const day of dayDirs) {
    const dayPath = join(root, day);
    if (!statSync(dayPath).isDirectory()) continue;
    for (const name of readdirSync(dayPath)) {
      if (!name.endsWith('.json')) continue;
      const path = join(dayPath, name);
      const { mtimeMs } = statSync(path);
      if (!newest || mtimeMs > newest.mtimeMs) newest = { path, mtimeMs };
    }
  }

  if (!newest) {
    console.error(`[restore-snapshot] FATAL: no .json snapshots found under ${root}`);
    process.exit(1);
  }
  return newest.path;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  // --table <name> restricts the restore to a single table.
  let only: string | undefined;
  const tableFlag = args.indexOf('--table');
  if (tableFlag !== -1) {
    only = args[tableFlag + 1];
    if (!only) {
      console.error('[restore-snapshot] FATAL: --table requires a table name');
      process.exit(1);
    }
    args.splice(tableFlag, 2);
  }

  const file = args[0] ?? findLatestSnapshot(join(process.cwd(), 'backups'));
  const tables = parseSnapshot(file);

  // Restore known tables in dependency order; anything unrecognised follows.
  const names = Object.keys(tables)
    .filter((t) => (only ? t === only : true))
    .sort((a, b) => {
      const ia = TABLE_ORDER.indexOf(a as (typeof TABLE_ORDER)[number]);
      const ib = TABLE_ORDER.indexOf(b as (typeof TABLE_ORDER)[number]);
      return (ia === -1 ? TABLE_ORDER.length : ia) - (ib === -1 ? TABLE_ORDER.length : ib);
    });

  if (names.length === 0) {
    console.error(`[restore-snapshot] FATAL: nothing to restore from ${file}`);
    if (only) console.error(`[restore-snapshot]        table '${only}' is not in this snapshot`);
    process.exit(1);
  }

  console.log('[restore-snapshot] About to restore:');
  console.log(`[restore-snapshot]   file:   ${file}`);
  console.log(`[restore-snapshot]   target: the project in NEXT_PUBLIC_SUPABASE_URL`);
  for (const t of names) {
    console.log(`[restore-snapshot]   ${t}: ${tables[t].rows.length} rows`);
  }
  console.log(`[restore-snapshot] Rows with a matching ${CONFLICT_COLUMN} will be OVERWRITTEN.`);
  console.log('[restore-snapshot] Rows added since the snapshot are left in place.');

  if (process.env.RESTORE_YES !== '1') {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const answer = await rl.question("[restore-snapshot] Type 'yes' to continue: ");
    rl.close();
    if (answer !== 'yes') {
      console.log('[restore-snapshot] Aborted.');
      process.exit(1);
    }
  }

  const supabase = createAdminClient();
  let restored = 0;

  for (const table of names) {
    const rows = tables[table].rows;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from(table)
        .upsert(batch as never, { onConflict: CONFLICT_COLUMN });

      if (error) {
        console.error(`[restore-snapshot] FATAL: ${table}: batch at offset ${i} failed: ${error.message}`);
        console.error(`[restore-snapshot]        ${restored} rows were already written; the restore is PARTIAL.`);
        process.exit(1);
      }
      restored += batch.length;
    }
    console.log(`[restore-snapshot] ${table}: ${rows.length} rows restored`);
  }

  console.log(`[restore-snapshot] Done. Restored ${restored} rows from ${file}`);
}

main().catch((err) => {
  console.error('[restore-snapshot] FATAL:', err);
  process.exit(1);
});
