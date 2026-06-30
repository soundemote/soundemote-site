-- ============================================================
-- Wikipedia-style wiki pages with trusted auto-publish + review
-- Run this on your Supabase project (SQL editor).
-- Depends on: public.has_role / public.app_role / public.user_roles
--   (from supabase/claim_review.sql) and public.profiles.
-- ============================================================

-- 0. Add a 'trusted' role to the enum -----------------------------------------
do $$ begin
  alter type public.app_role add value if not exists 'trusted';
exception when undefined_object then
  -- enum doesn't exist yet: create it
  create type public.app_role as enum ('admin','moderator','trusted','user');
end $$;

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
  with check (public.has_role(auth.uid(),'trusted') or public.has_role(auth.uid(),'admin'));

drop policy if exists "trusted update wiki pages" on public.wiki_pages;
create policy "trusted update wiki pages"
  on public.wiki_pages for update
  to authenticated
  using (public.has_role(auth.uid(),'trusted') or public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'trusted') or public.has_role(auth.uid(),'admin'));

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
  using (editor_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- Admins moderate the queue.
drop policy if exists "admins update edits" on public.wiki_edits;
create policy "admins update edits"
  on public.wiki_edits for update
  to authenticated
  using (public.has_role(auth.uid(),'admin'))
  with check (public.has_role(auth.uid(),'admin'));

-- Done. Grant trust to a user with:
--   insert into public.user_roles(user_id, role)
--   select id,'trusted' from auth.users where email = 'someone@example.com'
--   on conflict do nothing;
