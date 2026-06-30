-- ============================================================
-- User accounts: profiles + banks + patches
-- Run this on your Supabase project (SQL editor).
-- Handles are picked at signup. Routing:
--   /@handle              -> profile
--   /@handle/bank         -> bank
--   /@handle/bank/patch   -> patch
-- ============================================================

-- 1. Profiles -----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  handle text not null unique
    check (handle ~ '^[a-z0-9_]{3,30}$'),
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill columns if the table pre-existed without them.
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_handle_key'
  ) and not exists (
    select 1 from public.profiles where handle is null
  ) then
    alter table public.profiles add constraint profiles_handle_key unique (handle);
  end if;
end $$;

create index if not exists profiles_handle_idx on public.profiles (lower(handle));

grant select on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- 2. Reserved handles ---------------------------------------------------------
create table if not exists public.reserved_handles (
  handle text primary key
);
grant select on public.reserved_handles to anon, authenticated;
grant all on public.reserved_handles to service_role;
alter table public.reserved_handles enable row level security;
drop policy if exists "reserved handles readable" on public.reserved_handles;
create policy "reserved handles readable"
  on public.reserved_handles for select
  to anon, authenticated using (true);

insert into public.reserved_handles (handle) values
  ('admin'),('sandbox'),('share'),('api'),('app'),('www'),('soundemote'),
  ('about'),('login'),('logout'),('signup'),('auth'),('settings'),('help'),
  ('support'),('root'),('system'),('mod'),('moderator'),('null'),('undefined')
on conflict do nothing;

-- 3. Banks --------------------------------------------------------------------
create table if not exists public.banks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9_-]{1,50}$'),
  name text,
  description text,
  created_at timestamptz not null default now(),
  unique (owner_id, slug)
);

create index if not exists banks_owner_idx on public.banks (owner_id);

grant select on public.banks to anon;
grant select, insert, update, delete on public.banks to authenticated;
grant all on public.banks to service_role;

alter table public.banks enable row level security;

drop policy if exists "banks are public" on public.banks;
create policy "banks are public"
  on public.banks for select to anon, authenticated using (true);

drop policy if exists "owners write banks" on public.banks;
create policy "owners write banks"
  on public.banks for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 4. Patches ------------------------------------------------------------------
create table if not exists public.patches (
  id uuid primary key default gen_random_uuid(),
  bank_id uuid not null references public.banks(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9_-]{1,50}$'),
  name text,
  description text,
  project_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bank_id, slug)
);

create index if not exists patches_bank_idx on public.patches (bank_id);
create index if not exists patches_owner_idx on public.patches (owner_id);

grant select on public.patches to anon;
grant select, insert, update, delete on public.patches to authenticated;
grant all on public.patches to service_role;

alter table public.patches enable row level security;

drop policy if exists "patches are public" on public.patches;
create policy "patches are public"
  on public.patches for select to anon, authenticated using (true);

drop policy if exists "owners write patches" on public.patches;
create policy "owners write patches"
  on public.patches for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- 5. Auto-create profile from signup metadata --------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handle text;
begin
  v_handle := lower(coalesce(new.raw_user_meta_data->>'handle', ''));
  if v_handle ~ '^[a-z0-9_]{3,30}$'
     and not exists (select 1 from public.reserved_handles where handle = v_handle)
     and not exists (select 1 from public.profiles where lower(handle) = v_handle) then
    insert into public.profiles (id, handle, display_name)
    values (new.id, v_handle, new.raw_user_meta_data->>'display_name')
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user();
