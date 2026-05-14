/**
 * backup-product-codes.ts
 *
 * Writes a JSON snapshot of every product_codes row to
 * backups/YYYY-MM-DD/product_codes_<timestamp>.json
 *
 * Lightweight, dependency-free alternative to a full pg_dump when the
 * PostgreSQL client tools are unavailable. Intended as a rollback safety net
 * before running scripts/backfill-display-name.ts (which only mutates the
 * product_codes table).
 *
 * Usage:
 *   npm run db:snapshot
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 * The npm script loads them from .env.local via `tsx --env-file`.
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createAdminClient } from '../app/lib/supabase/admin';

/** Rows fetched per page, kept small to stay under statement timeouts. */
const BATCH_SIZE = 200;

async function main(): Promise<void> {
  const supabase = createAdminClient();

  const rows: unknown[] = [];
  let from = 0;

  for (;;) {
    const to = from + BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from('product_codes')
      .select('*')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`[snapshot] FATAL: failed to fetch rows ${from}-${to}: ${error.message}`);
      process.exit(1);
    }
    if (!data || data.length === 0) break;

    rows.push(...data);
    from += BATCH_SIZE;
  }

  const now = new Date();
  const date = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const stamp = now.toISOString().replace(/[:.]/g, '-'); // file-safe timestamp

  const dir = join(process.cwd(), 'backups', date);
  mkdirSync(dir, { recursive: true });

  const file = join(dir, `product_codes_${stamp}.json`);
  writeFileSync(
    file,
    JSON.stringify({ table: 'product_codes', exportedAt: now.toISOString(), count: rows.length, rows }, null, 2),
  );

  console.log(`[snapshot] wrote ${rows.length} rows -> ${file}`);
}

main().catch((err) => {
  console.error('[snapshot] FATAL:', err);
  process.exit(1);
});
