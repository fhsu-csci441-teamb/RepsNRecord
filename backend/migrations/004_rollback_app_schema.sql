-- Rollback migration for the combined schema.
-- WARNING: This will DROP tables and indexes. Use carefully.

-- To be run only if you want to fully remove the schema introduced above.

DROP INDEX IF EXISTS photos_user_taken_idx;
DROP INDEX IF EXISTS user_roles_role_idx;
DROP INDEX IF EXISTS trainer_clients_trainer_client_idx;
DROP INDEX IF EXISTS shared_exports_trainer_idx;
DROP INDEX IF EXISTS connection_requests_from_idx;
DROP INDEX IF EXISTS connection_requests_to_idx;

DROP TABLE IF EXISTS shared_exports;
DROP TABLE IF EXISTS trainer_clients;
DROP TABLE IF EXISTS connection_requests;
DROP TABLE IF EXISTS personal_records;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS user_preferences;
DROP TABLE IF EXISTS photos;

-- No extension is dropped. If needed, explicitly drop pgcrypto:
-- DROP EXTENSION IF EXISTS pgcrypto;