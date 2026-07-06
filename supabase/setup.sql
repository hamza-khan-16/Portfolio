-- ─────────────────────────────────────────────────────────────────────────────
-- Portfolio Admin Panel — Supabase Setup
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor → New query)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Projects table
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  num         text not null default '01',
  title       text not null,
  description text not null default '',
  tags        text not null default '',
  live_url    text not null default '',
  image_url   text not null default '',
  created_at  timestamptz default now()
);

-- 2. Site-wide settings (hero photo, about photo)
create table if not exists public.site_settings (
  id               text primary key default 'main',
  hero_image_url   text not null default '',
  about_image_url  text not null default '',
  updated_at       timestamptz default now()
);

-- Seed a default row so upsert always works
insert into public.site_settings (id)
  values ('main')
  on conflict (id) do nothing;

-- 3. RLS policies (anon key can read; only service role can write from server)
--    For this client-side admin panel we allow anon INSERT/UPDATE/DELETE too.
--    Lock this down further with Supabase Auth if you want more security.
alter table public.projects enable row level security;
alter table public.site_settings enable row level security;

create policy "Allow anon read projects"
  on public.projects for select using (true);

create policy "Allow anon insert projects"
  on public.projects for insert with check (true);

create policy "Allow anon update projects"
  on public.projects for update using (true);

create policy "Allow anon delete projects"
  on public.projects for delete using (true);

create policy "Allow anon read site_settings"
  on public.site_settings for select using (true);

create policy "Allow anon upsert site_settings"
  on public.site_settings for insert with check (true);

create policy "Allow anon update site_settings"
  on public.site_settings for update using (true);

-- 4. Storage bucket for uploaded images
--    Run this or create the bucket manually in Storage → New bucket
insert into storage.buckets (id, name, public)
  values ('portfolio', 'portfolio', true)
  on conflict (id) do nothing;

-- Allow anon to upload and read files in the portfolio bucket
create policy "Allow anon upload to portfolio"
  on storage.objects for insert
  with check (bucket_id = 'portfolio');

create policy "Allow anon read portfolio files"
  on storage.objects for select
  using (bucket_id = 'portfolio');
