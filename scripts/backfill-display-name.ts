/**
 * backfill-display-name.ts
 *
 * Adds/updates `description_data.displayName` on every product_codes row,
 * derived deterministically from `description_data.generated` via the shared
 * structural-word dictionary (see app/lib/description/translate.ts).
 *
 * Usage:
 *   npm run db:backfill                # dry-run (default): counts + 10 examples, no writes
 *   npm run db:backfill -- --dry-run   # same as above, explicit
 *   npm run db:backfill -- --run       # performs the update
 *
 * Safety guarantees:
 *   - never touches `description_data.generated`
 *   - preserves every existing key inside `description_data`
 *   - only adds/updates `displayName`
 *   - idempotent: re-running produces the same result (writes only on diff)
 *   - batched paging to avoid statement timeouts
 *   - per-row failures are logged and the run continues
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the env.
 * The npm script loads them from .env.local via `tsx --env-file`.
 */

import { createAdminClient } from '../app/lib/supabase/admin';
import { translateDescription } from '../app/lib/description/translate';

/** Rows fetched per page. Small enough to stay well under statement timeouts. */
const BATCH_SIZE = 200;

type DescriptionData = {
  generated?: unknown;
  displayName?: unknown;
  [key: string]: unknown;
};

type ProductRow = {
  id: string;
  description_data: DescriptionData | null;
};

async function main(): Promise<void> {
  const isRun = process.argv.includes('--run');
  const mode = isRun ? 'RUN' : 'DRY-RUN';
  console.log(`[backfill] mode: ${mode} (batch size ${BATCH_SIZE})`);

  const supabase = createAdminClient();

  let from = 0;
  let scanned = 0;
  let changed = 0;
  let skipped = 0;
  let failed = 0;
  const examples: { id: string; before: string; after: string }[] = [];

  for (;;) {
    const to = from + BATCH_SIZE - 1;
    const { data, error } = await supabase
      .from('product_codes')
      .select('id, description_data')
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error(`[backfill] FATAL: failed to fetch rows ${from}-${to}: ${error.message}`);
      process.exit(1);
    }
    if (!data || data.length === 0) break;

    for (const row of data as ProductRow[]) {
      scanned++;
      try {
        const desc = row.description_data;
        const generated =
          desc && typeof desc.generated === 'string' ? desc.generated : null;

        // No generated description -> nothing to translate from. Skip safely.
        if (!desc || generated === null) {
          skipped++;
          continue;
        }

        const displayName = translateDescription(generated);

        // Idempotency: only write when the value actually differs.
        if (desc.displayName === displayName) {
          skipped++;
          continue;
        }

        if (examples.length < 10) {
          examples.push({
            id: row.id,
            before: typeof desc.displayName === 'string' ? desc.displayName : '(none)',
            after: displayName,
          });
        }

        if (isRun) {
          // Preserve every existing key; only add/update displayName.
          const nextDescriptionData = { ...desc, displayName };
          const { error: updateError } = await supabase
            .from('product_codes')
            .update({ description_data: nextDescriptionData })
            .eq('id', row.id);

          if (updateError) {
            failed++;
            console.error(`[backfill] row ${row.id}: update failed: ${updateError.message}`);
            continue;
          }
        }

        changed++;
      } catch (err) {
        failed++;
        console.error(`[backfill] row ${row.id}: ${(err as Error).message}`);
      }
    }

    from += BATCH_SIZE;
  }

  console.log('');
  console.log('[backfill] --- summary ---');
  console.log(`[backfill] scanned:               ${scanned}`);
  console.log(`[backfill] ${isRun ? 'updated:               ' : 'would change:          '}${changed}`);
  console.log(`[backfill] skipped:               ${skipped} (no generated / already current)`);
  console.log(`[backfill] failed:                ${failed}`);

  if (examples.length > 0) {
    console.log('');
    console.log(`[backfill] up to 10 before/after examples:`);
    for (const ex of examples) {
      console.log(`  ${ex.id}`);
      console.log(`    before: ${ex.before}`);
      console.log(`    after:  ${ex.after}`);
    }
  }

  if (!isRun) {
    console.log('');
    console.log('[backfill] dry-run only — no rows were written. Re-run with --run to apply.');
  }
}

main().catch((err) => {
  console.error('[backfill] FATAL:', err);
  process.exit(1);
});
