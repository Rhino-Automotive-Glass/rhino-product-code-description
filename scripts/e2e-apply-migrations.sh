#!/usr/bin/env bash
#
# e2e-apply-migrations.sh — apply the migrations a baseline schema does not
# already contain, to a local database.
#
# supabase/e2e/schema.sql is a snapshot of production, so it already contains
# every migration that has been run there. Replaying those would fail or
# re-do work; skipping the newer ones would mean CI never executes the SQL
# that is about to run against production. The split is recorded explicitly in
# a manifest, because supabase/migrations/ mixes legacy names (001_*.sql,
# add_verified_column.sql) with timestamped ones and cannot be split by
# sorting alone.
#
# Anything in the migration directory that the manifest does not list is
# pending and gets applied, in byte-wise filename order. A failing migration
# stops the run immediately.
#
# Local databases only. This script never talks to a remote project and is
# not a substitute for `supabase db push` (which this repo never runs).
#
# Usage: e2e-apply-migrations.sh <local-db-url> <migrations-dir> <manifest-file>

set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "[e2e-migrate] usage: $(basename "$0") <local-db-url> <migrations-dir> <manifest-file>" >&2
  exit 2
fi

DB_URL="$1"
MIGRATIONS_DIR="$2"
MANIFEST_FILE="$3"

# Same guard as scripts/e2e-db.sh: credentials are stripped first so a URL
# like postgresql://user@evil.example/db can never look local.
HOST_PART="${DB_URL#postgres://}"
HOST_PART="${HOST_PART#postgresql://}"
HOST_PART="${HOST_PART#*@}"
case "$DB_URL" in
  postgres://*|postgresql://*) ;;
  *)
    echo "[e2e-migrate] ERROR: not a postgres URL." >&2
    exit 1
    ;;
esac
case "$HOST_PART" in
  127.0.0.1:*|127.0.0.1/*|localhost:*|localhost/*|'[::1]:'*) ;;
  *)
    echo "[e2e-migrate] ERROR: refusing to apply migrations to a non-local database: ${HOST_PART%%/*}" >&2
    exit 1
    ;;
esac

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "[e2e-migrate] ERROR: migrations directory not found: $MIGRATIONS_DIR" >&2
  exit 1
fi
if [ ! -f "$MANIFEST_FILE" ]; then
  echo "[e2e-migrate] ERROR: baseline manifest not found: $MANIFEST_FILE" >&2
  exit 1
fi

# --- read the manifest ------------------------------------------------------
# One migration filename per line. `#` starts a comment; blank lines are
# ignored. Entries are bare filenames inside the migration directory: a path
# separator or `..` would let the manifest point outside it.
baseline=()
manifest_errors=0
lineno=0
while IFS= read -r raw || [ -n "$raw" ]; do
  lineno=$((lineno + 1))
  entry="${raw%%#*}"
  entry="${entry#"${entry%%[![:space:]]*}"}"
  entry="${entry%"${entry##*[![:space:]]}"}"
  [ -n "$entry" ] || continue

  case "$entry" in
    */*|..|.|-*)
      echo "[e2e-migrate] ERROR: $MANIFEST_FILE:$lineno: invalid entry '$entry' (bare .sql filenames only)." >&2
      manifest_errors=$((manifest_errors + 1))
      continue
      ;;
  esac
  case "$entry" in
    *.sql) ;;
    *)
      echo "[e2e-migrate] ERROR: $MANIFEST_FILE:$lineno: invalid entry '$entry' (must end in .sql)." >&2
      manifest_errors=$((manifest_errors + 1))
      continue
      ;;
  esac

  for seen in ${baseline[@]+"${baseline[@]}"}; do
    if [ "$seen" = "$entry" ]; then
      echo "[e2e-migrate] ERROR: $MANIFEST_FILE:$lineno: duplicate entry '$entry'." >&2
      manifest_errors=$((manifest_errors + 1))
      continue 2
    fi
  done

  # A manifest entry with no file means the migration was renamed or deleted
  # while the baseline still contains it: the split is no longer trustworthy.
  if [ ! -f "$MIGRATIONS_DIR/$entry" ]; then
    echo "[e2e-migrate] ERROR: $MANIFEST_FILE:$lineno: '$entry' is not in $MIGRATIONS_DIR." >&2
    manifest_errors=$((manifest_errors + 1))
    continue
  fi

  baseline+=("$entry")
done < "$MANIFEST_FILE"

if [ "$manifest_errors" -gt 0 ]; then
  echo "[e2e-migrate] ERROR: $manifest_errors invalid manifest entr(y|ies); not applying anything." >&2
  exit 1
fi

# --- pick the pending migrations -------------------------------------------
pending=()
total=0
while IFS= read -r file; do
  name="$(basename "$file")"
  total=$((total + 1))
  for seen in ${baseline[@]+"${baseline[@]}"}; do
    if [ "$seen" = "$name" ]; then
      continue 2
    fi
  done
  pending+=("$name")
done < <(find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' | LC_ALL=C sort)

if [ "${#pending[@]}" -eq 0 ]; then
  echo "[e2e-migrate] No pending migrations: all $total migration(s) are already in the baseline schema."
  exit 0
fi

echo "[e2e-migrate] ${#pending[@]} of $total migration(s) not in the baseline schema; applying in filename order."
for name in "${pending[@]}"; do
  echo "[e2e-migrate] applying $name"
  if ! psql "$DB_URL" -X -q -v ON_ERROR_STOP=1 -f "$MIGRATIONS_DIR/$name"; then
    echo "[e2e-migrate] ERROR: migration failed: $name" >&2
    exit 1
  fi
done
echo "[e2e-migrate] Applied ${#pending[@]} pending migration(s)."
