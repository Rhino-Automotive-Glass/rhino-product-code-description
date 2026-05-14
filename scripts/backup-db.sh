#!/usr/bin/env bash
#
# backup-db.sh — Create a compressed, restorable backup of the Supabase
# PostgreSQL database using pg_dump's custom format.
#
# Usage:
#   ./scripts/backup-db.sh
#   npm run db:backup
#
# Output:
#   backups/YYYY-MM-DD/backup_YYYY-MM-DD_HHMMSS.dump
#
# Requirements:
#   - PostgreSQL client tools (pg_dump) on PATH
#   - SUPABASE_DB_URL set in the environment or in .env at the project root
#
# Compatible with macOS and Linux (bash).

# Fail safely:
#   -e  exit on any error
#   -u  treat unset variables as errors
#   -o pipefail  fail if any command in a pipeline fails
set -euo pipefail

# --- Resolve paths -----------------------------------------------------------
# Resolve the project root relative to this script so the command works no
# matter what directory it is invoked from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Load environment variables ---------------------------------------------
# Secrets and credentials are never hard-coded. Load them from .env if present;
# any value already exported in the shell takes precedence over the file.
ENV_FILE="$ROOT_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "[backup] Loading environment from $ENV_FILE"
  # 'set -a' marks every sourced variable for export.
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

# --- Validate prerequisites -------------------------------------------------
# Ensure the database URL is available before doing any work.
if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "[backup] ERROR: SUPABASE_DB_URL is not set." >&2
  echo "[backup]        Set it in the environment or in $ENV_FILE (see .env.example)." >&2
  exit 1
fi

# Ensure pg_dump is installed and reachable.
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "[backup] ERROR: 'pg_dump' not found on PATH." >&2
  echo "[backup]        Install the PostgreSQL client tools (see README)." >&2
  exit 1
fi

# --- Build output paths ------------------------------------------------------
# Date is used for the daily folder; time disambiguates multiple runs per day.
DATE="$(date +%F)"          # e.g. 2026-05-14
TIME="$(date +%H%M%S)"      # e.g. 142530
BACKUP_DIR="$ROOT_DIR/backups/$DATE"
BACKUP_FILE="$BACKUP_DIR/backup_${DATE}_${TIME}.dump"

# Create the daily backup directory if it does not exist yet.
mkdir -p "$BACKUP_DIR"

# --- Run the backup ----------------------------------------------------------
echo "[backup] Starting pg_dump -> $BACKUP_FILE"

# --format=custom  : compressed, restorable archive (use with pg_restore)
# --no-owner       : restore works regardless of the target role names
# --no-privileges  : skip GRANT/REVOKE so restores are portable across projects
# --verbose        : progress output for useful logs
# Schema, tables and indexes are all included by default with this format.
pg_dump "$SUPABASE_DB_URL" \
  --format=custom \
  --no-owner \
  --no-privileges \
  --verbose \
  --file="$BACKUP_FILE"

# --- Report ------------------------------------------------------------------
# Human-readable size, portable across macOS (BSD) and Linux (GNU) du.
BACKUP_SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
echo "[backup] Done. Created $BACKUP_FILE ($BACKUP_SIZE)"
