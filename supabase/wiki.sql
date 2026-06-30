-- ============================================================
-- Wikipedia-style wiki pages with trusted auto-publish + review
-- Run this on your Supabase project (SQL editor).
-- Self-contained: creates its own role table + helper functions so it
-- does NOT depend on supabase/claim_review.sql being run first.
-- ============================================================

-- 0. Roles infrastructure (safe if claim_review.sql already ran) ---------------
-- Create the enum if missing. (If it already exists, this is a no-op and the
-- 'trusted' value is added in a SEPARATE statement below — a new enum value
-- cannot be used in the same transaction it is added.)
do $$ begin
  create type public.app_role as enum ('admin','moderator','trusted','user');
exception when duplicate_object then null; end $$;

-- Add 'trusted' if the enum predates this file. Committed before it is used.
alter type public.app_role add value if not exists 'trusted';

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Text-based role helpers. Comparing role::text avoids needing enum literals,
-- so these work even right after 'trusted' was added to the enum.
create or replace function public.is_admin(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _uid and role::text = 'admin')
$$;

create or replace function public.is_trusted(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _uid and role::text in ('trusted','admin'))
$$;

-- 1. Canonical published pages ------------------------------------------------
create table if not exists public.wiki_pages (
  slug text primary key,
  title text,
  body text not null default '',
  project_data jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Public read; only trusted/admin write directly.
grant select on public.wiki_pages to anon, authenticated;
grant insert, update on public.wiki_pages to authenticated;
grant all on public.wiki_pages to service_role;

alter table public.wiki_pages enable row level security;

drop policy if exists "wiki pages public read" on public.wiki_pages;
create policy "wiki pages public read"
  on public.wiki_pages for select
  to anon, authenticated
  using (true);

drop policy if exists "trusted write wiki pages" on public.wiki_pages;
create policy "trusted write wiki pages"
  on public.wiki_pages for insert
  to authenticated
  with check (public.is_trusted(auth.uid()));

drop policy if exists "trusted update wiki pages" on public.wiki_pages;
create policy "trusted update wiki pages"
  on public.wiki_pages for update
  to authenticated
  using (public.is_trusted(auth.uid()))
  with check (public.is_trusted(auth.uid()));

-- 2. Proposed edits queue -----------------------------------------------------
create table if not exists public.wiki_edits (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  editor_id uuid references auth.users(id) on delete cascade not null,
  title text,
  body text,
  project_data jsonb,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_note text
);

create index if not exists wiki_edits_status_idx on public.wiki_edits (status, created_at desc);
create index if not exists wiki_edits_slug_idx on public.wiki_edits (slug, created_at desc);

grant select, insert on public.wiki_edits to authenticated;
grant update on public.wiki_edits to authenticated;
grant all on public.wiki_edits to service_role;

alter table public.wiki_edits enable row level security;

-- Logged-in users may submit an edit as themselves; new rows start pending.
drop policy if exists "users submit edits" on public.wiki_edits;
create policy "users submit edits"
  on public.wiki_edits for insert
  to authenticated
  with check (editor_id = auth.uid() and status in ('pending','approved'));

-- Editors can read their own edits; admins read everything.
drop policy if exists "read own or admin edits" on public.wiki_edits;
create policy "read own or admin edits"
  on public.wiki_edits for select
  to authenticated
  using (editor_id = auth.uid() or public.is_admin(auth.uid()));

-- Admins moderate the queue.
drop policy if exists "admins update edits" on public.wiki_edits;
create policy "admins update edits"
  on public.wiki_edits for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Done. Grant trust to a user with:
--   insert into public.user_roles(user_id, role)
--   select id,'trusted' from auth.users where email = 'someone@example.com'
--   on conflict do nothing;
