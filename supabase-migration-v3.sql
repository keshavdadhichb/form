-- Migration v3: add phone column to stories table
-- Run this if you already ran the original migration (supabase-migration.sql)

ALTER TABLE stories
  ADD COLUMN IF NOT EXISTS phone text;
