#!/usr/bin/env bash
set -euo pipefail

# run_migrations.sh
# Apply our SQL migration files to the Postgres database via psql.
# Usage:
#   export DATABASE_URL="postgresql://user:pass@host:port/dbname" && ./backend/run_migrations.sh
# Or specify the connection string manually as first argument:
#   ./backend/run_migrations.sh "postgresql://user:pass@host:port/dbname"

CONN=${1:-${DATABASE_URL:-}}
if [ -z "$CONN" ]; then
  echo "ERROR: DATABASE_URL must be set or passed as the first argument"
  echo "Example: DATABASE_URL=\"postgresql://user:pass@host:port/dbname\" ./backend/run_migrations.sh"
  exit 1
fi

# Ensure psql is available
if ! command -v psql > /dev/null; then
  echo "ERROR: psql is not installed or on PATH. Install Postgres client tools to continue."
  exit 1
fi

# Run the migrations in order
migrations=(
  "001_create_photos.sql"
  "002_create_user_preferences.sql"
  "003_create_user_roles.sql"
  "004_create_app_schema_and_indexes.sql"
  "005_seed_demo_users.sql"
  "006_seed_admin_and_demo_data.sql"
  "007_create_trainer_permissions.sql"
  "008_add_email_to_user_preferences.sql"
)

for file in "${migrations[@]}"; do
  path="$(dirname "$0")/migrations/${file}"
  if [ ! -f "$path" ]; then
    echo "Skipping missing migration $path"
    continue
  fi
  echo "Applying $file..."
  psql "$CONN" -f "$path"
  echo "Applied $file"
done

echo "All migrations applied (or skipped if missing)."
