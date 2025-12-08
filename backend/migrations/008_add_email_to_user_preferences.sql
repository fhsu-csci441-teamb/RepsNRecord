-- Migration: Add email column to user_preferences table

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index for efficient email searches
CREATE INDEX IF NOT EXISTS user_preferences_email_idx 
ON user_preferences(email) 
WHERE email IS NOT NULL;
