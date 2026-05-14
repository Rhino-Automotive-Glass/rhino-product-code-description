# Display Name Translation Flow

How `description_data.displayName` (the Spanish display name) is produced and
kept in sync.

## What it is

Each `product_codes` row stores `description_data`, a JSON object:

```jsonc
{
  "parte": "q",
  "posicion": "Front",
  "lado": "Left",
  "generated": "QUARTER FRONT LEFT PEUGEOT PARTNER 2019",   // English, source of truth
  "displayName": "CUARTO DELANTERA IZQUIERDA PEUGEOT PARTNER 2019" // Spanish, derived
}
```

- `generated` — the English structured description. **Never modified** by the
  translation logic.
- `displayName` — derived from `generated` by a deterministic, dictionary-based
  translation. The read path prefers `displayName ?? generated`.

## The translation function

`app/lib/description/translate.ts` — `translateDescription(generated)`:

- Splits `generated` into tokens (whitespace preserved).
- Replaces only **whole tokens** that match `STRUCTURAL_DICTIONARY`
  (e.g. `DOOR → PUERTA`, `QUARTER → CUARTO`, `AND → Y`).
- Preserves brand, model, year, version and any unknown token exactly.
- **Idempotent** — Spanish output words are not dictionary keys, so re-running
  on an already-translated string is a no-op.

`app/lib/description/withDisplayName.ts` — `withDisplayName(description)`:
returns a copy of a `description` object with `displayName` set from
`generated`. Preserves every existing key. If `generated` is missing/empty the
input is returned untouched.

## Write path — creating a product

1. Dashboard builds `description.generated` client-side
   (`generateProductDescription()` in `app/(dashboard)/page.tsx`).
2. `POST /api/products` with `body.description`.
3. `app/api/products/route.ts` runs `withDisplayName(body.description)` before
   insert — `displayName` is computed **server-side**, so the client cannot
   bypass or fake it.
4. Row is inserted with both `generated` and `displayName`.

## Write path — editing a product

1. `EditProductModal` produces the updated `description` (with a fresh
   `generated`).
2. `PATCH /api/products/[id]` with `body.description`.
3. `app/api/products/[id]/route.ts` (admin branch) runs
   `withDisplayName(body.description)` before update — `displayName` is
   recomputed from the new `generated`.
4. Row is updated; every other `description_data` key is preserved.

> The QA/approver PATCH branch only toggles `verified` and never touches
> `description_data`.

## Read path

Consumers prefer `displayName`, falling back to `generated`:

- `app/components/SavedProductsTable.tsx` — table cell
- `app/api/products/search/route.ts` — search API result
- `app/(dashboard)/page.tsx` — description column sort

## Backfill (existing rows)

`scripts/backfill-display-name.ts` (`npm run db:backfill`) applies the same
`translateDescription` to existing rows. Dry-run by default; `-- --run` to
write. Batched, idempotent, logs per-row failures and continues.
`scripts/backup-product-codes.ts` (`npm run db:snapshot`) writes a JSON
snapshot of `product_codes` first as a rollback safety net.

Re-run the backfill after changing `STRUCTURAL_DICTIONARY` to bring existing
rows in line with the new dictionary.

## Adding a dictionary word

1. Add the entry to `STRUCTURAL_DICTIONARY` in
   `app/lib/description/translate.ts`.
2. Update/extend `tests/translate.spec.ts`.
3. New writes pick it up automatically. For existing rows, re-run
   `npm run db:backfill` (snapshot first with `npm run db:snapshot`).
