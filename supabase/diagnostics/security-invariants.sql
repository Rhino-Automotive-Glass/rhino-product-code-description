-- ============================================
-- Security invariants — fails (RAISE EXCEPTION) if any is violated.
-- ============================================
-- Read-only. Run with: psql "$DB_URL" -v ON_ERROR_STOP=1 -f <this file>
--
-- Runs after every nightly backup (production) and after every
-- `npm run e2e:db` (local copy), so a regression — a new function callable
-- with the anon key, a table without RLS — fails a job instead of going
-- unnoticed. Rules come from migrations 010-015.
--
-- To allow something on purpose, change the rule here in the same PR.

DO $$
DECLARE
  violations text[] := '{}';
  item text;
BEGIN
  -- 1. anon may call no function in `public` except the allowlisted ones.
  --    Trigger functions are excluded: they cannot be called directly.
  FOR item IN
    SELECT p.oid::regprocedure::text
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prorettype NOT IN ('pg_catalog.trigger'::regtype, 'pg_catalog.event_trigger'::regtype)
      AND pg_catalog.has_function_privilege('anon', p.oid, 'EXECUTE')
      AND p.proname NOT IN ('normalize_brand_name')
    ORDER BY 1
  LOOP
    violations := violations || ('anon can EXECUTE ' || item);
  END LOOP;

  -- 2. Every table in `public` has row level security enabled.
  FOR item IN
    SELECT c.relname::text
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
    ORDER BY 1
  LOOP
    violations := violations || ('RLS disabled on public.' || item);
  END LOOP;

  -- 3. Every function in `public` pins its search_path.
  FOR item IN
    SELECT p.oid::regprocedure::text
    FROM pg_catalog.pg_proc p
    JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND NOT EXISTS (
        SELECT 1 FROM pg_catalog.unnest(coalesce(p.proconfig, '{}')) cfg
        WHERE cfg LIKE 'search_path=%'
      )
    ORDER BY 1
  LOOP
    violations := violations || ('search_path not pinned on ' || item);
  END LOOP;

  -- 4. The event trigger that keeps new functions private is installed and on.
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_event_trigger
    WHERE evtname = 'rhino_lock_down_new_functions' AND evtenabled <> 'D'
  ) THEN
    violations := violations || 'event trigger rhino_lock_down_new_functions missing or disabled'::text;
  END IF;

  -- 5. The `private` schema (internal helpers, migration 015) stays closed to
  --    the API roles.
  FOR item IN
    SELECT r.rolname::text
    FROM pg_catalog.pg_roles r
    WHERE r.rolname IN ('anon', 'authenticated')
      AND EXISTS (SELECT 1 FROM pg_catalog.pg_namespace WHERE nspname = 'private')
      AND pg_catalog.has_schema_privilege(r.rolname, 'private', 'USAGE')
    ORDER BY 1
  LOOP
    violations := violations || (item || ' has USAGE on schema private');
  END LOOP;

  IF pg_catalog.cardinality(violations) > 0 THEN
    RAISE EXCEPTION E'Security invariants violated (%):\n  - %',
      pg_catalog.cardinality(violations), pg_catalog.array_to_string(violations, E'\n  - ');
  END IF;

  RAISE NOTICE 'Security invariants OK';
END $$;
