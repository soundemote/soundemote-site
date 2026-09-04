-- ============================================================
-- Named page patches
-- A patch bound to a public URL (e.g. /init). Anyone can view it.
-- Only trusted/admin accounts may create a new slug. Only the
-- owner (or an admin) may overwrite / delete it.
-- Depends on public.is_trusted / public.is_admin from wiki.sql.
-- Run this on your Supabase project (SQL editor).
-- ============================================================

create table if not exists public.page_patches (
  slug text primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_data jsonb not null,
  updated_at timestamptz not null default now()
);

grant select on public.page_patches to anon, authenticated;
grant insert, update, delete on public.page_patches to authenticated;
grant all on public.page_patches to service_role;

alter table public.page_patches enable row level security;

-- Public read: visitors see whatever patch is bound to the page.
drop policy if exists "page_patches read" on public.page_patches;
create policy "page_patches read"
  on public.page_patches for select
  using (true);

-- Trusted/admin may claim a new slug (must set themselves as owner).
drop policy if exists "page_patches insert own" on public.page_patches;
drop policy if exists "page_patches trusted insert" on public.page_patches;
create policy "page_patches trusted insert"
  on public.page_patches for insert
  to authenticated
  with check (public.is_trusted(auth.uid()) and owner_id = auth.uid());

-- Owner or admin may overwrite. Admin may keep or reassign owner_id.
drop policy if exists "page_patches update own" on public.page_patches;
drop policy if exists "page_patches trusted update" on public.page_patches;
create policy "page_patches trusted update"
  on public.page_patches for update
  to authenticated
  using (
    public.is_trusted(auth.uid())
    and (owner_id = auth.uid() or public.is_admin(auth.uid()))
  )
  with check (
    public.is_trusted(auth.uid())
    and (owner_id = auth.uid() or public.is_admin(auth.uid()))
  );

-- Owner or admin may delete.
drop policy if exists "page_patches delete own" on public.page_patches;
drop policy if exists "page_patches trusted delete" on public.page_patches;
create policy "page_patches trusted delete"
  on public.page_patches for delete
  to authenticated
  using (
    public.is_trusted(auth.uid())
    and (owner_id = auth.uid() or public.is_admin(auth.uid()))
  );
