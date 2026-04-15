-- ─── Pariwar Website — Supabase Migration ───────────────────────────────────
-- Run this in your Supabase project: Dashboard → SQL Editor → New Query

-- 1. Create stories table
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  dob date,
  father_name text,
  mother_name text,
  qualifications text,
  achievements text,
  hobbies text,
  story_type text check (story_type in ('text','audio','video','upload')),
  story_text text,
  photo_url text,
  media_url text,
  language text check (language in ('hi','en')),
  hidden boolean default false
);

-- 2. Enable Row Level Security
alter table stories enable row level security;

-- 3. Public insert policy (anyone with the link can submit)
create policy "allow_insert" on stories
  for insert
  with check (true);

-- 4. No public select (only service role / admin can read)
--    The admin API uses the service role key, which bypasses RLS
--    So we intentionally do NOT create a select policy here.

-- ─── Storage Buckets ─────────────────────────────────────────────────────────
-- Run these two commands in: Dashboard → Storage → New Bucket (or use the SQL below)

-- Create buckets (if using SQL approach with storage schema)
-- Note: Usually easier to create via the Storage UI in the Dashboard.
-- Bucket 1: pariwar-photos — Public: yes
-- Bucket 2: pariwar-media  — Public: yes

-- If you want to do it via SQL:
insert into storage.buckets (id, name, public) values ('pariwar-photos', 'pariwar-photos', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('pariwar-media', 'pariwar-media', true)
  on conflict (id) do nothing;

-- Storage policies — allow anon inserts
create policy "allow_public_upload_photos" on storage.objects
  for insert to anon
  with check (bucket_id = 'pariwar-photos');

create policy "allow_public_read_photos" on storage.objects
  for select to anon
  using (bucket_id = 'pariwar-photos');

create policy "allow_public_upload_media" on storage.objects
  for insert to anon
  with check (bucket_id = 'pariwar-media');

create policy "allow_public_read_media" on storage.objects
  for select to anon
  using (bucket_id = 'pariwar-media');
