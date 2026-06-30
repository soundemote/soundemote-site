-- ============================================================
-- Claim-a-URL with Admin Review
-- Run this on your Supabase project (SQL editor).
-- ============================================================

-- 1. Submissions queue --------------------------------------------------------
create table if not exists public.patch_claims (
  id uuid primary key default gen_random_uuid(),
  requested_slug text not null,
  contact_email text not null,
  note text,
  project_data jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  review_note text
);

create index if not exists patch_claims_status_idx on public.patch_claims (status, created_at desc);

-- Data API grants
grant insert on public.patch_claims to anon;
grant select, insert, update on public.patch_claims to authenticated;
grant all on public.patch_claims to service_role;

alter table public.patch_claims enable row level security;

-- 2. Roles --------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin','moderator','user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

-- 3. RLS policies -------------------------------------------------------------
-- Anyone may submit a claim; the row defaults to status = 'pending'.
drop policy if exists "anon can submit claims" on public.patch_claims;
create policy "anon can submit claims"
  on public.patch_claims for insert
  to anon, authenticated
  with check (status = 'pending');

drop policy if exists "admins read claims" on public.patch_claims;
create policy "admins read claims"
  on public.patch_claims for select
  to authenticated
  using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "admins update claims" on public.patch_claims;
create policy "admins update claims"
  on public.patch_claims for update
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles"
  on public.user_roles for select
  to authenticated
  using (user_id = auth.uid());

-- Admin must be able to write approved snapshots into shared_projects.
drop policy if exists "admins write shared projects" on public.shared_projects;
create policy "admins write shared projects"
  on public.shared_projects for all
  to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 4. Admin-email auto-grant ---------------------------------------------------
-- !!! REPLACE the email below with YOUR admin email address. !!!
create or replace function public.grant_admin_for_known_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null
     and lower(new.email) = lower('YOUR_EMAIL@example.com') then
    insert into public.user_roles (user_id, role)
    values (new.id, 'admin')
    on conflict (user_id, role) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_grant_admin on auth.users;
create trigger on_auth_user_created_grant_admin
after insert on auth.users
for each row execute function public.grant_admin_for_known_email();

drop trigger if exists on_auth_user_confirmed_grant_admin on auth.users;
create trigger on_auth_user_confirmed_grant_admin
after update of email_confirmed_at on auth.users
for each row
when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
execute function public.grant_admin_for_known_email();

-- If you already signed up before setting your email above, run once:
--   insert into public.user_roles (user_id, role)
--   select id, 'admin' from auth.users where lower(email) = lower('YOUR_EMAIL@example.com')
--   on conflict do nothing;
