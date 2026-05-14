#!/usr/bin/env bash
#
# restore-db.sh — Restore the Supabase PostgreSQL database from a pg_dump
# custom-format backup created by scripts/backup-db.sh.
#
# Usage:
#   ./scripts/restore-db.sh                      # restore the most recent backup
#   ./scripts/restore-db.sh path/to/backup.dump  # restore a specific backup
#   npm run db:restore
#   npm run db:restore -- path/to/backup.dump
#
# Requirements:
#   - PostgreSQL client tools (pg_restore) on PATH
#   - SUPABASE_DB_URL set in the environment or in .env at the project root
#
# WARNING: this is destructive. --clean drops existing objects before
# recreating them. A confirmation prompt is shown before anything runs.
#
# Compatible with macOS and Linux (bash).

# Fail safely on errors and unset variables.
set -euo pipefail

# --- Resolve paths -----------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUPS_ROOT="$ROOT_DIR/backups"

# --- Load environment variables ---------------------------------------------
# Same .env loading strategy as backup-db.sh — no credentials in source.
ENV_FILE="$ROOT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "[restore] Loading environment from $ENV_FILE"
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

# --- Validate prerequisites -------------------------------------------------
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "[restore] ERROR: SUPABASE_DB_URL is not set." >&2
  echo "[restore]         Set it in the environment or in $ENV_FILE (see .env.example)." >&2
  exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "[restore] ERROR: 'pg_restore' not found on PATH." >&2
  echo "[restore]         Install the PostgreSQL client tools (see README)." >&2
  exit 1
fi

# --- Determine which backup file to restore ---------------------------------
# If a path is passed as the first argument, use it. Otherwise auto-select the
# most recent .dump file. Backup filenames are timestamped, so a lexical sort
# puts the newest entry last.
if [ "$#" -ge 1 ] && [ -n "$1" ]; then
  BACKUP_FILE="$1"
else
  echo "[restore] No file given — searching for the latest backup in $BACKUPS_ROOT"
  if [ ! -d "$BACKUPS_ROOT" ]; then
    echo "[restore] ERROR: no backups directory found at $BACKUPS_ROOT" >&2
    echo "[restore]         Run 'npm run db:backup' first." >&2
    exit 1
  fi
  # find + sort + tail is portable across macOS (BSD) and Linux (GNU).
  BACKUP_FILE="$(find "$BACKUPS_ROOT" -type f -name '*.dump' | sort | tail -n 1)"
  if [ -z "$BACKUP_FILE" ]; then
    echo "[restore] ERROR: no .dump files found under $BACKUPS_ROOT" >&2
    exit 1
  fi
fi

# Ensure the chosen file actually exists before prompting.
if [ ! -f "$BACKUP_FILE" ]; then
  echo "[restore] ERROR: backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

# --- Confirm before performing a destructive restore ------------------------
echo "[restore] About to restore:"
echo "[restore]   file:     $BACKUP_FILE"
echo "[restore]   into:     the database referenced by SUPABASE_DB_URL"
echo "[restore] This will DROP and recreate existing objects (--clean --if-exists)."
# Skip the prompt in non-interactive environments (CI) when RESTORE_YES=1.
if [ "${RESTORE_YES:-}" != "1" ]; then
  printf "[restore] Type 'yes' to continue: "
  read -r CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "[restore] Aborted."
    exit 1
  fi
fi

# --- Run the restore ---------------------------------------------------------
echo "[restore] Starting pg_restore..."

# --clean        : drop database objects before recreating them
# --if-exists    : avoid errors when an object to drop does not exist
# --no-owner     : do not restore ownership, matching the backup flags
# --no-privileges: do not restore GRANT/REVOKE statements
# --verbose      : progress output for useful logs
# --dbname       : the connection string is also the restore target
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  --dbname="$SUPABASE_DB_URL" \
  "$BACKUP_FILE"

echo "[restore] Done. Restored from $BACKUP_FILE"
