# Legacy catalog sync gap

## Proposed change

Exact SQL: [migration](../supabase/migrations/20260923064618_backfill_legacy_catalog_sync.sql). A new private helper preserves the live INSERT mapping for draft product defaults, normalized brand upsert, first-marca primary brand, and distinct brand memberships. Both source triggers call that helper when a catalog row is missing. Existing-row UPDATE behavior stays unchanged. Backfill visits every missing source row without updating `product_codes` or any existing catalog row.

A unique index on `products.product_code_id` enforces one catalog product per source and supports `ON CONFLICT DO NOTHING` during overlapping writes. Helper locks and rereads source row before mapping it. API roles lose direct EXECUTE grants on trigger functions; existing triggers still run as table owner.

Catalog app owns `products`. Unique index still needs a matching rhino-catalog migration. This repository-history follow-up was not completed before production execution.

## Live definition change

```diff
 IF v_product_id IS NULL THEN
+  PERFORM private.ensure_catalog_entry(NEW.id);
   RETURN NEW;
 END IF;
```

`create_catalog_entry()` keeps trigger signature, definer privileges, and pinned search path; body now calls shared helper. Existing-row UPDATE branch remains intact. Full production definition snapshot, unified diff, affected-row preview, and exact expected counts were supplied in local review bundle rather than committed to public repository.

## Verification

Run [read-only diagnostics](../supabase/diagnostics/catalog-sync-legacy-gap.sql) before and after approved execution. Save missing IDs, counts, trigger definitions, grants, and existing catalog row snapshots before migration. Expected after state: no missing mirrors, no duplicate `product_code_id`, valid primary-brand memberships, and byte-for-byte unchanged pre-existing catalog rows. Brand count may rise only for a missing source whose normalized marca did not already exist.

Local disposable Supabase tests:

- [role and sync regression](../supabase/tests/catalog_sync_legacy_gap.sql): anon/viewer access, editor/admin/service insert/update, rows created by different users, empty and duplicate marca, preservation, and function grants.
- [concurrency](../supabase/tests/catalog_sync_concurrency.sh): source insert during backfill and two overlapping backfills.
- [full migration repeat](../supabase/tests/catalog_sync_migration_repeat.sh): apply twice; one missing row filled once, pre-existing catalog row unchanged.

## Deployment and rollback

Migration was applied to production after explicit owner approval on 2026-09-23. Production verification passed; exact execution evidence remains in the private local review bundle. Production and repo migration histories differ; `supabase/config.toml` disables local replay. Do not run `supabase db push` or reapply this migration.

For rollback, stop source writes and snapshot catalog edits since backfill. Restore trigger function definitions and grants from pre-execution snapshot. Delete only products created by backfill whose catalog-owned fields and group links are still untouched; membership rows cascade. Keep edited or published rows for manual reconciliation. Drop helper after restoring functions; drop unique index only after checking writer dependencies. Record rollback as a new migration; do not rewrite migration history.
