-- ============================================================
-- Bare-slug site pages
-- Maps a bare root slug (e.g. /supersaw) to a rendering style.
-- Any trusted/admin user may claim an unused slug. Only the
-- creator (or admin) can rewrite it later.
-- Depends on the roles infrastructure created by supabase/wiki.sql.
-- Run this on your Supabase project (SQL editor).
-- ============================================================

create table if not exists public.site_pages (
  slug text primary key,
  style text not null check (style in ('homepage','wiki','sandbox')),
  target_slug text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.site_pages to anon, authenticated;
grant insert, update, delete on public.site_pages to authenticated;
grant all on public.site_pages to service_role;

alter table public.site_pages enable row level security;

drop policy if exists "site_pages public read" on public.site_pages;
create policy "site_pages public read"
  on public.site_pages for select
  using (true);

drop policy if exists "site_pages trusted insert" on public.site_pages;
create policy "site_pages trusted insert"
  on public.site_pages for insert
  to authenticated
  with check (public.is_trusted(auth.uid()) and created_by = auth.uid());

drop policy if exists "site_pages trusted update" on public.site_pages;
create policy "site_pages trusted update"
  on public.site_pages for update
  to authenticated
  using (public.is_trusted(auth.uid()) and (created_by = auth.uid() or public.is_admin(auth.uid())))
  with check (public.is_trusted(auth.uid()));

drop policy if exists "site_pages admin delete" on public.site_pages;
create policy "site_pages admin delete"
  on public.site_pages for delete
  to authenticated
  using (public.is_admin(auth.uid()));
