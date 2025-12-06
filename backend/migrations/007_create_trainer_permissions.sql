-- Create trainer_permissions table so clients can allow/deny exports to trainers
CREATE TABLE IF NOT EXISTS trainer_permissions (
  id SERIAL PRIMARY KEY,
  trainer_id TEXT NOT NULL,
  client_id TEXT NOT NULL,
  allow_export BOOLEAN NOT NULL DEFAULT true,
  allow_photos BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'trainer_permissions_trainer_client_idx') THEN
    CREATE UNIQUE INDEX trainer_permissions_trainer_client_idx
    ON trainer_permissions (trainer_id, client_id);
  END IF;
END$$;
