-- ============================================================
-- User files metadata table + privacy rules
-- Run this on your Supabase project (SQL editor).
-- Assumes public.is_admin() already exists from wiki.sql.
-- ============================================================

create table if not exists public.user_files (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9_-]{1,50}$'),
  name text,
  description text,
  is_public boolean not null default false,
  storage_path text,
  size integer,
  mime_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists user_files_owner_idx on public.user_files (owner_id);
create index if not exists user_files_public_idx on public.user_files (owner_id) where is_public = true;

-- Data API grants
grant select on public.user_files to anon;
grant select, insert, update, delete on public.user_files to authenticated;
grant all on public.user_files to service_role;

alter table public.user_files enable row level security;

-- Public read: anyone can see public files
-- Owner read: the "users manage own files" policy below lets owners see their own private files too
-- Note: using is_public = true, but owner_id = auth.uid() policy is also checked, so both rules apply
-- (RLS policies are OR'd together for SELECT)
drop policy if exists "user files public read" on public.user_files;
create policy "user files public read"
  on public.user_files for select
  to anon, authenticated
  using (is_public = true);

-- Owner full control
drop policy if exists "users manage own files" on public.user_files;
create policy "users manage own files"
  on public.user_files for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Admin full control
drop policy if exists "admins manage all files" on public.user_files;
create policy "admins manage all files"
  on public.user_files for all
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
