#!/usr/bin/env bash
#
# e2e-db.sh — start a local Supabase and load the e2e schema + test user.
#
# Used by CI and locally before `npm test`. Idempotent: every run wipes the
# local `public` schema and reloads it, so each test run starts from the same
# state. Never touches a remote project — the URL is taken from
# `supabase status` and must point at localhost.
#
# Requirements: Docker running, Supabase CLI, psql.
#
# Usage: npm run e2e:db

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

for bin in supabase psql docker; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    echo "[e2e-db] ERROR: '$bin' not found on PATH." >&2
    exit 1
  fi
done

# Services the tests do not use; skipping them makes startup much faster.
EXCLUDE="studio,imgproxy,mailpit,logflare,vector,supavisor,edge-runtime,postgres-meta,realtime,storage-api"

if ! supabase status >/dev/null 2>&1; then
  echo "[e2e-db] Starting local Supabase..."
  supabase start -x "$EXCLUDE"
fi

DB_URL="$(supabase status -o env | sed -n 's/^DB_URL="\(.*\)"$/\1/p')"
case "$DB_URL" in
  postgresql://*@127.0.0.1:*|postgresql://*@localhost:*) ;;
  *)
    echo "[e2e-db] ERROR: refusing to load into non-local database: ${DB_URL%%@*}@..." >&2
    exit 1
    ;;
esac

echo "[e2e-db] Resetting public schema and loading supabase/e2e/*.sql"
psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 <<'SQL'
-- Remove anything a previous run created, including the test user.
DROP SCHEMA IF EXISTS public CASCADE;
DELETE FROM auth.users WHERE email IN ('e2e-editor@example.test', 'e2e-viewer@example.test');
-- Recreate `public` as Supabase ships it; schema.sql adds the object grants.
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
SQL

psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 \
  -f supabase/e2e/schema.sql \
  -f supabase/e2e/seed.sql

# Same checks the nightly backup runs against production: the local copy must
# honour them too, or schema.sql was generated from a pre-hardening backup.
echo "[e2e-db] Checking security invariants"
psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 -f supabase/diagnostics/security-invariants.sql

echo "[e2e-db] Ready: $(psql "$DB_URL" -X -At -c "SELECT count(*) FROM public.roles") roles, test user e2e-editor@example.test"
