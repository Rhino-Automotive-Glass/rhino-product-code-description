#!/usr/bin/env bash
#
# migration_runner.sh — regression coverage for scripts/e2e-apply-migrations.sh.
#
# The runner decides which migrations the e2e setup applies on top of the
# baseline supabase/e2e/schema.sql. A wrong decision either hides a broken
# migration from CI or replays one the baseline already contains, so every
# selection rule gets a case here.
#
# Local only: each case runs against a throwaway database on the local
# Supabase Postgres, and the migration fixtures live in temp directories —
# supabase/migrations/ is never written to.
#
# Usage: bash supabase/tests/migration_runner.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
RUNNER="$ROOT_DIR/scripts/e2e-apply-migrations.sh"

TEST_DB=e2e_migration_runner_test
ADMIN_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
TEST_URL="postgresql://postgres:postgres@127.0.0.1:54322/$TEST_DB"

TMP_ROOT="$(mktemp -d)"
failures=0

cleanup() {
  rm -rf "$TMP_ROOT"
  psql "$ADMIN_URL" -X -q -v ON_ERROR_STOP=1 \
    -c "DROP DATABASE IF EXISTS $TEST_DB WITH (FORCE)" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# Fresh database per case: the applied-marker table starts empty every time.
reset_db() {
  psql "$ADMIN_URL" -X -q -v ON_ERROR_STOP=1 \
    -c "DROP DATABASE IF EXISTS $TEST_DB WITH (FORCE)" \
    -c "CREATE DATABASE $TEST_DB" >/dev/null
  psql "$TEST_URL" -X -q -v ON_ERROR_STOP=1 \
    -c "CREATE TABLE applied (seq serial primary key, name text not null)" >/dev/null
}

# Order the migrations ran in, comma separated.
applied_order() {
  psql "$TEST_URL" -X -At -v ON_ERROR_STOP=1 \
    -c "SELECT coalesce(string_agg(name, ',' ORDER BY seq), '') FROM applied"
}

# A migration whose only effect is recording that it ran.
marker_migration() {
  printf "INSERT INTO applied (name) VALUES ('%s');\n" "$1"
}

expect_eq() {
  local what="$1" want="$2" got="$3"
  if [[ "$got" != "$want" ]]; then
    echo "  FAIL: $what: expected '$want', got '$got'" >&2
    failures=$((failures + 1))
    return 1
  fi
}

report() {
  local name="$1" status="$2"
  if [[ "$status" == ok ]]; then
    echo "  ok: $name"
  else
    echo "  FAIL: $name" >&2
    failures=$((failures + 1))
  fi
}

new_case_dir() {
  local d
  d="$(mktemp -d "$TMP_ROOT/caseXXXXXX")"
  mkdir -p "$d/migrations"
  printf '%s\n' "$d"
}

# --- 1. manifest-listed migration is skipped, unlisted one is applied --------
case_selection() {
  echo "case: manifest-listed migration skipped, unlisted applied"
  local d; d="$(new_case_dir)"
  marker_migration baseline > "$d/migrations/001_baseline.sql"
  marker_migration pending  > "$d/migrations/002_pending.sql"
  cat > "$d/manifest.txt" <<'MANIFEST'
# already represented by the baseline schema
001_baseline.sql

MANIFEST

  reset_db
  local out
  if ! out="$(bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" 2>&1)"; then
    echo "$out" >&2
    report "runner exits 0 with one pending migration" fail
    return
  fi
  expect_eq "applied migrations" "pending" "$(applied_order)" \
    && report "only the unlisted migration ran" ok
  if grep -q '002_pending.sql' <<<"$out"; then
    report "applied filename is logged" ok
  else
    echo "$out" >&2
    report "applied filename is logged" fail
  fi
  if grep -q '001_baseline.sql' <<<"$(applied_order)"; then
    report "baseline migration must not be logged as applied" fail
  fi
}

# --- 2. manifest entry with no matching file fails setup --------------------
case_missing_manifest_entry() {
  echo "case: manifest entry without a migration file fails"
  local d; d="$(new_case_dir)"
  marker_migration pending > "$d/migrations/002_pending.sql"
  printf '001_gone.sql\n' > "$d/manifest.txt"

  reset_db
  if bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" >/dev/null 2>&1; then
    report "runner must fail on a manifest entry with no file" fail
    return
  fi
  report "runner fails on a manifest entry with no file" ok
  expect_eq "nothing applied after validation failure" "" "$(applied_order)" \
    && report "no migration ran" ok
}

# --- 3. duplicate manifest entry fails --------------------------------------
case_duplicate_manifest_entry() {
  echo "case: duplicate manifest entry fails"
  local d; d="$(new_case_dir)"
  marker_migration baseline > "$d/migrations/001_baseline.sql"
  printf '001_baseline.sql\n001_baseline.sql\n' > "$d/manifest.txt"

  reset_db
  if bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" >/dev/null 2>&1; then
    report "runner must fail on a duplicate manifest entry" fail
    return
  fi
  report "runner fails on a duplicate manifest entry" ok
}

# --- 4. path-like / traversing manifest entries are rejected ----------------
case_invalid_manifest_entry() {
  echo "case: path-traversal and non-.sql manifest entries are rejected"
  local d entry
  for entry in '../outside.sql' 'nested/001_baseline.sql' '001_baseline.txt'; do
    d="$(new_case_dir)"
    marker_migration baseline > "$d/migrations/001_baseline.sql"
    printf '%s\n' "$entry" > "$d/manifest.txt"
    reset_db
    if bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" >/dev/null 2>&1; then
      report "runner must reject manifest entry '$entry'" fail
    else
      report "manifest entry '$entry' rejected" ok
    fi
  done
}

# --- 5. a broken pending migration stops the run, nonzero -------------------
case_broken_migration() {
  echo "case: broken pending migration exits nonzero and stops the run"
  local d; d="$(new_case_dir)"
  marker_migration first > "$d/migrations/001_first.sql"
  printf 'SELECT * FROM table_that_does_not_exist;\n' > "$d/migrations/002_broken.sql"
  marker_migration third > "$d/migrations/003_third.sql"
  : > "$d/manifest.txt"

  reset_db
  if bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" >/dev/null 2>&1; then
    report "runner must fail when a migration errors" fail
    return
  fi
  report "runner fails when a migration errors" ok
  expect_eq "run stops at the first failure" "first" "$(applied_order)" \
    && report "migrations after the failure did not run" ok
}

# --- 6. non-local database URL is refused -----------------------------------
case_non_local_url() {
  echo "case: non-local database URL is refused"
  local d; d="$(new_case_dir)"
  marker_migration pending > "$d/migrations/001_pending.sql"
  : > "$d/manifest.txt"

  local url
  for url in 'postgresql://postgres:postgres@db.example.com:5432/postgres' \
             'postgresql://postgres:postgres@10.0.0.5:5432/postgres'; do
    if bash "$RUNNER" "$url" "$d/migrations" "$d/manifest.txt" >/dev/null 2>&1; then
      report "runner must refuse '$url'" fail
    else
      report "refused '$url'" ok
    fi
  done
}

# --- 7. pending migrations run in deterministic filename order --------------
case_deterministic_order() {
  echo "case: pending migrations run in deterministic filename order"
  local d; d="$(new_case_dir)"
  marker_migration c > "$d/migrations/010_c.sql"
  marker_migration a > "$d/migrations/001_a.sql"
  marker_migration d > "$d/migrations/20260101_d.sql"
  marker_migration b > "$d/migrations/002_b.sql"
  : > "$d/manifest.txt"

  reset_db
  if ! bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" >/dev/null 2>&1; then
    report "runner exits 0 applying four migrations" fail
    return
  fi
  expect_eq "filename order" "a,b,c,d" "$(applied_order)" \
    && report "applied in sorted filename order" ok
}

# --- 8. nothing pending: clear message, exit 0 ------------------------------
case_no_pending() {
  echo "case: no pending migrations"
  local d; d="$(new_case_dir)"
  marker_migration baseline > "$d/migrations/001_baseline.sql"
  printf '001_baseline.sql\n' > "$d/manifest.txt"

  reset_db
  local out
  if ! out="$(bash "$RUNNER" "$TEST_URL" "$d/migrations" "$d/manifest.txt" 2>&1)"; then
    echo "$out" >&2
    report "runner exits 0 when nothing is pending" fail
    return
  fi
  report "runner exits 0 when nothing is pending" ok
  if grep -qi 'no pending migrations' <<<"$out"; then
    report "prints a clear no-pending message" ok
  else
    echo "$out" >&2
    report "prints a clear no-pending message" fail
  fi
  expect_eq "nothing applied" "" "$(applied_order)" \
    && report "baseline migration did not run" ok
}

if [[ ! -f "$RUNNER" ]]; then
  echo "ERROR: runner not found: $RUNNER" >&2
  exit 1
fi

case_selection
case_missing_manifest_entry
case_duplicate_manifest_entry
case_invalid_manifest_entry
case_broken_migration
case_non_local_url
case_deterministic_order
case_no_pending

if (( failures > 0 )); then
  echo "migration_runner: $failures check(s) failed" >&2
  exit 1
fi
echo 'migration_runner: all checks passed.'
