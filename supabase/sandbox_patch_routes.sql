-- Sandbox patch route contract.
-- Canonical public URL:
--   /:owner_name/:bank_slug/:patch_slug
-- Developer shortlink URL:
--   /:slug -> /:target_user/:target_bank/:target_patch

alter table public.shared_projects
  add column if not exists owner_name text not null default 'soundemote',
  add column if not exists bank_slug text,
  add column if not exists patch_slug text;

update public.shared_projects
set
  bank_slug = coalesce(
    nullif(regexp_replace(lower(trim(bank_name)), '[^a-z0-9]+', '-', 'g'), ''),
    'main'
  ),
  patch_slug = coalesce(
    nullif(regexp_replace(lower(trim(slug)), '[^a-z0-9]+', '-', 'g'), ''),
    slug
  )
where bank_slug is null
   or patch_slug is null;

alter table public.shared_projects
  alter column bank_slug set default 'main',
  alter column patch_slug set default 'patch',
  alter column bank_slug set not null,
  alter column patch_slug set not null;

create unique index if not exists shared_projects_route_key
  on public.shared_projects (owner_name, bank_slug, patch_slug);

create table if not exists public.patch_shortlinks (
  slug text primary key,
  target_user text not null,
  target_bank text not null,
  target_patch text not null,
  created_at timestamptz not null default now()
);

create index if not exists patch_shortlinks_target_idx
  on public.patch_shortlinks (target_user, target_bank, target_patch);

-- Example:
-- insert into public.patch_shortlinks (slug, target_user, target_bank, target_patch)
-- values ('sinewave', 'elanhickler', 'basics', 'sinewave')
-- on conflict (slug) do update
-- set target_user = excluded.target_user,
--     target_bank = excluded.target_bank,
--     target_patch = excluded.target_patch;
