Migrations README

This project stores SQL migrations under `backend/migrations/`.

How to apply the migrations manually (psql):

1. Ensure environment variables are set: DATABASE_URL or set via psql arguments.

2. Run the combined migration or individual migrations in order (for example):

```bash
# Example using environment variable
psql "$DATABASE_URL" -f backend/migrations/001_create_photos.sql
psql "$DATABASE_URL" -f backend/migrations/002_create_user_preferences.sql
psql "$DATABASE_URL" -f backend/migrations/003_create_user_roles.sql
psql "$DATABASE_URL" -f backend/migrations/004_create_app_schema_and_indexes.sql
psql "$DATABASE_URL" -f backend/migrations/007_create_trainer_permissions.sql
```

This will create or update the tables used by the application.

To rollback (destructive):

```bash
psql "$DATABASE_URL" -f backend/migrations/004_rollback_app_schema.sql
```

Notes:
- IF YOU DON'T HAVE DB ACCESS: Please provide these commands to your DBA.
- These migrations are intended to be idempotent where possible (use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
- For safety, do not run rollback in production unless you want to remove data.

Permissions for Trainers:
- When a trainer-client connection is created, a default `trainer_permissions` row is inserted with `allow_export = true` and `allow_photos = false`.
- Clients can control per-trainer permissions using the API: `PUT /api/trainer/permissions` with JSON { clientId, trainerId, allowExport, allowPhotos }.
- Trainers requesting exports will be blocked if `allow_export` is false; photo inclusion is only allowed if `allow_photos` is true.

3. Convenience scripts

If you don't want to run these one-by-one, a convenience script is provided:

```bash
# Make scripts executable once
chmod +x backend/run_migrations.sh backend/run_rollback.sh

# Run the migrations (ensure DATABASE_URL is set)
DATABASE_URL="postgresql://user:pass@host:port/dbname" ./backend/run_migrations.sh

# To rollback (destructive):
DATABASE_URL="postgresql://user:pass@host:port/dbname" ./backend/run_rollback.sh
```

## Seeds

If you want to populate a demo trainer & client for local testing, we provided a seed migration:

```bash
# Make the seed script executable
chmod +x backend/run_seed.sh

# Run the seed (ensure DATABASE_URL is set)
DATABASE_URL="postgresql://user:pass@host:port/dbname" ./backend/run_seed.sh
```

If your environment has MongoDB (MONGODB_URI set), the `run_seed.sh` script will also insert a demo workout into Mongo via `backend/seed_mongo.js`.

4. Verify migrations
```
# Confirm tables are present
psql "$DATABASE_URL" -c "\dt"

# Verify specific table columns
psql "$DATABASE_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_preferences';"
```
Notes:
- IF YOU DON'T HAVE DB ACCESS: Please provide these commands to your DBA.
- These migrations are intended to be idempotent where possible (use IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
- For safety, do not run rollback in production unless you want to remove data.
