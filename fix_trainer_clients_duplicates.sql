-- Fix trainer_clients table duplicates and add unique constraint

-- Step 1: Remove duplicate entries, keeping only the oldest one for each trainer-client pair
DELETE FROM trainer_clients
WHERE id NOT IN (
  SELECT MIN(id)
  FROM trainer_clients
  GROUP BY trainer_id, client_id
);

-- Step 2: Create unique index if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'trainer_clients_trainer_client_idx') THEN
    CREATE UNIQUE INDEX trainer_clients_trainer_client_idx
    ON trainer_clients (trainer_id, client_id);
  END IF;
END$$;

-- Verify the fix
SELECT 
  trainer_id, 
  client_id, 
  COUNT(*) as count 
FROM trainer_clients 
GROUP BY trainer_id, client_id 
HAVING COUNT(*) > 1;
-- (Should return no rows if fix worked)
