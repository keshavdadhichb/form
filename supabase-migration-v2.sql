-- ─── Pariwar Website — Migration v2: AI fields ──────────────────────────────
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- (Only needed if you already ran supabase-migration.sql before)

alter table stories
  add column if not exists summary text,
  add column if not exists tags text[];
