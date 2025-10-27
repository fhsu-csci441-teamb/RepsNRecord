CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS photos (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  file_url     TEXT NOT NULL,
  thumb_url    TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  bytes        INTEGER NOT NULL CHECK (bytes > 0),
  width        INTEGER,
  height       INTEGER,
  taken_at     TIMESTAMPTZ,
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  checksum_md5 CHAR(32)
);

-- Simple composite index for efficient month range scans
CREATE INDEX IF NOT EXISTS photos_user_taken_idx
  ON photos (user_id, taken_at);
