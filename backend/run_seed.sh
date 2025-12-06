#!/usr/bin/env bash
set -euo pipefail

# run_seed.sh
# Run the seed migration to add demo trainer & client for local testing.
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:port/dbname" && ./backend/run_seed.sh
# Or specify the connection string manually as first argument:
#   ./backend/run_seed.sh "postgresql://user:pass@host:port/dbname"

CONN=${1:-${DATABASE_URL:-}}
if [ -z "$CONN" ]; then
  echo "ERROR: DATABASE_URL must be set or passed as the first argument"
  exit 1
fi

if ! command -v psql > /dev/null; then
  echo "ERROR: psql is not installed. Please install the Postgres CLI or ask your DBA to run the migration."
  exit 1
fi

SEED_FILE="$(dirname "$0")/migrations/005_seed_demo_users.sql"
if [ ! -f "$SEED_FILE" ]; then
  echo "ERROR: Seed file $SEED_FILE does not exist"
  exit 1
fi

echo "Applying demo seed file: $SEED_FILE"
psql "$CONN" -f "$SEED_FILE"

echo "Demo seed applied. Verify with:"
echo "psql \"$CONN\" -c \"SELECT user_id, role FROM user_roles WHERE user_id IN ('demo_trainer_1','demo_client_1');\""

# Optionally seed Mongo data if MONGODB_URI is available
if command -v node > /dev/null && [ -n "${MONGODB_URI:-}" ]; then
  echo "Seeding MongoDB with demo workout..."
  node "$(dirname "$0")/seed_mongo.js"
  echo "Mongo seed complete"
fi
