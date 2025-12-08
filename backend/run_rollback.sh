#!/usr/bin/env bash
set -euo pipefail

# run_rollback.sh
# Roll back changes made by migration 004 (destructive)
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:port/dbname" && ./backend/run_rollback.sh
# Or pass connection string: ./backend/run_rollback.sh "postgresql://..."

CONN=${1:-${DATABASE_URL:-}}
if [ -z "$CONN" ]; then
  echo "ERROR: DATABASE_URL must be set or passed as the first argument"
  exit 1
fi

if ! command -v psql > /dev/null; then
  echo "ERROR: psql is not installed or on PATH. Install Postgres client tools to continue."
  exit 1
fi

ROLLBACK_FILE="$(dirname "$0")/migrations/004_rollback_app_schema.sql"
if [ ! -f "$ROLLBACK_FILE" ]; then
  echo "ERROR: Rollback file $ROLLBACK_FILE does not exist"
  exit 1
fi

psql "$CONN" -f "$ROLLBACK_FILE"

echo "Rollback completed (destructive)."
