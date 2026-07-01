-- ============================================================
-- Per-user init patch for the soemdsp sandbox.
-- New users fall back to wikireview's init patch until they save their own.
-- Run this in the Supabase SQL editor.
-- ============================================================

create table if not exists public.user_init_patches (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  project_data jsonb not null,
  updated_at timestamptz not null default now()
);

grant select on public.user_init_patches to anon, authenticated;
grant insert, update, delete on public.user_init_patches to authenticated;
grant all on public.user_init_patches to service_role;

alter table public.user_init_patches enable row level security;

-- Public read so anyone (incl. logged-out visitors) can load the wikireview fallback.
drop policy if exists "init patches are public" on public.user_init_patches;
create policy "init patches are public"
  on public.user_init_patches for select
  to anon, authenticated using (true);

drop policy if exists "owners write init patch" on public.user_init_patches;
create policy "owners write init patch"
  on public.user_init_patches for all
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
