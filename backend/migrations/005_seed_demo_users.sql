-- Seed: demo trainer and client for local testing
-- Be non-destructive: use upsert and ignore if already present.

-- Demo Trainer
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES ('demo_trainer_1', 'trainer', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

INSERT INTO user_preferences (user_id, theme, weight_unit, notifications_enabled, email_reminders, weekly_summary, updated_at)
VALUES ('demo_trainer_1', 'light', 'lbs', true, false, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Demo Client
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES ('demo_client_1', 'user', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

INSERT INTO user_preferences (user_id, theme, weight_unit, notifications_enabled, email_reminders, weekly_summary, updated_at)
VALUES ('demo_client_1', 'light', 'lbs', true, false, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Create a trainer-client relationship so trainer UI shows the client
INSERT INTO trainer_clients (trainer_id, client_id, status, created_at)
VALUES ('demo_trainer_1', 'demo_client_1', 'active', NOW())
ON CONFLICT (trainer_id, client_id) DO UPDATE SET status = EXCLUDED.status;

-- Optionally, add a connection request row (commented out)
-- INSERT INTO connection_requests (from_user_id, to_user_id, from_role, status, message)
-- VALUES ('demo_trainer_1', 'demo_client_1', 'trainer', 'pending', 'Demo invite')
-- ON CONFLICT DO NOTHING;

COMMIT;