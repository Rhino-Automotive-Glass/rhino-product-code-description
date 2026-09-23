-- pending_migrations_applied.sql — proof that scripts/e2e-db.sh really ran the
-- migrations supabase/e2e/schema.sql does not contain.
--
-- Run against the local e2e database after `npm run e2e:db`. The baseline is a
-- production snapshot, so these objects can only exist here if the pending
-- migration executed. Update the checks when the baseline is regenerated and
-- the migration moves into supabase/e2e/migrations-in-schema.txt.
--
-- Usage: psql "$DB_URL" -X -v ON_ERROR_STOP=1 -f supabase/tests/pending_migrations_applied.sql

DO $$
BEGIN
  -- 20260923064618_backfill_legacy_catalog_sync.sql
  IF to_regprocedure('private.ensure_catalog_entry(uuid)') IS NULL THEN
    RAISE EXCEPTION 'private.ensure_catalog_entry(uuid) is missing: pending migrations were not applied';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    JOIN pg_class t ON t.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.relname = 'products_product_code_id_unique_idx'
      AND n.nspname = 'public'
      AND t.relname = 'products'
      AND i.indisunique
  ) THEN
    RAISE EXCEPTION 'unique index products_product_code_id_unique_idx is missing: pending migrations were not applied';
  END IF;

  -- The helper is internal: no API role may call it.
  IF has_function_privilege('anon', 'private.ensure_catalog_entry(uuid)', 'EXECUTE')
     OR has_function_privilege('authenticated', 'private.ensure_catalog_entry(uuid)', 'EXECUTE')
     OR has_function_privilege('service_role', 'private.ensure_catalog_entry(uuid)', 'EXECUTE') THEN
    RAISE EXCEPTION 'private.ensure_catalog_entry(uuid) is executable by an API role';
  END IF;

  RAISE NOTICE 'Pending migrations applied: catalog-sync helper and unique index present.';
END;
$$;
