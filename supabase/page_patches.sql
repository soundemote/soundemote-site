-- ============================================================
-- Named page patches
-- A patch bound to a public URL (e.g. /robinsupersaw). Anyone can
-- view it; only the account that saved it can overwrite it.
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

-- Only the owner can create/overwrite/remove their page patch.
drop policy if exists "page_patches insert own" on public.page_patches;
create policy "page_patches insert own"
  on public.page_patches for insert
  to authenticated
  with check (owner_id = auth.uid());

drop policy if exists "page_patches update own" on public.page_patches;
create policy "page_patches update own"
  on public.page_patches for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists "page_patches delete own" on public.page_patches;
create policy "page_patches delete own"
  on public.page_patches for delete
  to authenticated
  using (owner_id = auth.uid());
