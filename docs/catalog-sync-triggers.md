# Catalog Sync Triggers (product_codes → products)

## Overview

`product_codes` (this app, "App A") is the source of truth for product detail
data. `public.products` and its related tables (`brands`, `product_brands`) are
owned by the catalog app, **rhino-catalog** ("App B"). Both apps share one
Supabase database (`uzgomevojvzdzfunjhdr`).

Changes to `product_codes` are mirrored into `products` by database triggers.
This document records an incident where those triggers were broken by an
out-of-band schema change, and the fixes applied.

## The Incident

Saving products from the dashboard ("Guardar todo en base de datos") failed
with:

```
column "brands" of relation "products" does not exist
```

### Root cause

The AFTER INSERT trigger on `product_codes` runs `create_catalog_entry()`,
which inserts a mirror row into `products`. That function was written against
an **old denormalized `products` schema** and was never updated when
rhino-catalog migrated the schema:

- `rhino-catalog/.../202603170001_normalize_product_brands.sql` — removed
  `products.brand` (text) and `products.brands` (text[]); introduced the
  normalized `brands` table, `product_brands` membership table, and
  `products.primary_brand_id`.
- `rhino-catalog/.../202603180001_flatten_product_images.sql` — changed
  `products.images` from `jsonb` to `text[]`.

`create_catalog_entry()` still inserted into `brands`, `brand`, and a `jsonb`
`images` value — all invalid against the new schema, so every insert failed.

### Second, latent bug

The AFTER UPDATE trigger `touch_catalog_on_source_change()` only bumped
`products.updated_at` and **ignored `compatibility_data` entirely**. Edits to
marca / modelo / subModelo in `product_codes` never reached the catalog row, so
`products.model`, `products."subModel"`, `primary_brand_id`, and
`product_brands` silently went stale.

### Why the triggers were fragile

Neither `create_catalog_entry()` nor `touch_catalog_on_source_change()` (nor
their triggers) existed in **any** repo's migrations. They were hand-created
directly on the database, so the rhino-catalog schema migrations had no way to
keep them in sync.

## The Fixes

All three functions are now tracked in migrations.

### App A — `008_fix_create_catalog_entry.sql`

Rewrote `create_catalog_entry()` for the normalized schema. On INSERT it:

1. Upserts every distinct `marca` from `compatibility_data->'items'` into
   `brands` (deduped via the `normalize_brand_name(name)` expression unique
   index).
2. Inserts the `products` row: `status = 'draft'`, `images = ARRAY[]::text[]`,
   `price`/`stock` = 0, `model`/`subModel` from the first item, and
   `primary_brand_id` = the first marca's brand id.
3. Inserts `product_brands` membership rows for every marca.

### App A — `009_sync_catalog_on_source_update.sql`

Rewrote `touch_catalog_on_source_change()`. On UPDATE:

- If `compatibility_data` changed: re-syncs `model`, `subModel`,
  `primary_brand_id`, and `product_brands` membership (same brand-upsert logic
  as the insert path).
- Otherwise, if `product_code_data` or `description_data` changed: bumps
  `products.updated_at` only.

It also patches `prevent_source_managed_product_field_updates()` — see below.

### App B — `rhino-catalog/.../202605140001_allow_source_sync_field_bypass.sql`

rhino-catalog migration `202603170003` added a guard trigger
(`prevent_source_managed_product_field_updates`) that blocks non-`service_role`
clients from changing `primary_brand_id`, `model`, `subModel`. App A's sync
trigger runs as the `authenticated` role, so the guard would block the very
updates the source app must push.

Resolution: `touch_catalog_on_source_change()` sets a **transaction-local GUC**
`app.product_codes_sync = 'on'` before mutating `products`. The guard was
patched to return early when that flag is set. The catalog app itself never
sets the flag, so it remains blocked from mutating source-managed fields.

The guard patch is applied in App A's `009` migration (so the DB is correct)
**and** mirrored into rhino-catalog's `202605140001` migration (so that repo
stays authoritative for its own object).

## Key Constraints / Gotchas

- **Composite FK is deferred.** `products_primary_brand_membership_fkey
  (id, primary_brand_id) → product_brands(product_id, brand_id)` is
  `DEFERRABLE INITIALLY DEFERRED`. Triggers insert the `products` row before
  the `product_brands` membership; the FK is satisfied at commit.
- **`primary_brand_id` is set in the INSERT, never a later UPDATE.** A separate
  UPDATE would re-trigger the guard. `set_product_brands()` is *not* used by the
  sync path for the same reason (it does an UPDATE internally).
- **DELETE needs no trigger.** `products.product_code_id` FK is
  `ON DELETE CASCADE`; deleting a `product_code` removes its `products` row,
  which cascades to `product_brands`.
- **Empty marca payload on UPDATE.** `model`/`subModel` are still updated, but
  `primary_brand_id` and existing memberships are left intact, to avoid
  violating `products_published_requires_primary_brand` on a published row.
- **Brand dedup.** `brands` has a unique index on `normalize_brand_name(name)`;
  upserts use `ON CONFLICT (public.normalize_brand_name(name)) DO NOTHING`.
  `"Toyota"` and `"toyota "` collapse to one brand.

## Maintenance Rule

`product_codes` is the origin. Any change to how `product_codes` data maps into
the catalog must be made in **App A migrations** (`008`/`009` lineage). If the
change touches a catalog-owned object (e.g. the guard function), mirror it into
a **rhino-catalog migration** so that repo does not revert it on its next
migration run.

## Trigger Inventory (post-fix)

| Table | Trigger | Timing | Function |
|---|---|---|---|
| `product_codes` | `trg_product_codes_after_insert` | AFTER INSERT | `create_catalog_entry()` |
| `product_codes` | `trg_product_codes_after_update` | AFTER UPDATE | `touch_catalog_on_source_change()` |
| `product_codes` | `update_product_codes_updated_at` | BEFORE UPDATE | `update_updated_at_column()` |
| `products` | `trg_prevent_source_managed_product_field_updates` | BEFORE UPDATE OF `primary_brand_id`, `model`, `"subModel"` | `prevent_source_managed_product_field_updates()` |
