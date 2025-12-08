-- Seed: demo admin & demo photo to show photos list

-- Demo Admin
INSERT INTO user_roles (user_id, role, created_at, updated_at)
VALUES ('demo_admin_1', 'admin', NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role, updated_at = NOW();

INSERT INTO user_preferences (user_id, theme, weight_unit, notifications_enabled, email_reminders, weekly_summary, updated_at)
VALUES ('demo_admin_1', 'light', 'lbs', true, false, true, NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Demo photo for demo_client_1
INSERT INTO photos (user_id, file_url, thumb_url, mime_type, bytes, width, height, taken_at, description, created_at, checksum_md5)
VALUES ('demo_client_1', 'https://example.com/photo.jpg', 'https://example.com/photo-thumb.jpg', 'image/jpeg', 1024, 600, 800, NOW(), 'Demo photo', NOW(), '');

COMMIT;
